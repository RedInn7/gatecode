#!/usr/bin/env python3
"""
RetryGen-2: Fill outputs for PIDs > 1500 in retry_output_pids.json.

For each PID:
  1. Read inputs/<pid>.json
  2. Lookup frontend_question_id via slug in DB
  3. Find Python3 solution for real_pid
  4. Run wrapper against testcases (5s timeout each)
  5. Write filled JSON back
  6. UPDATE problems SET test_cases = ? WHERE slug = ?

Performance: ThreadPoolExecutor with 24 workers.
Git commit every ~25 filled PIDs.
"""

import json
import os
import subprocess
import sys
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import pymysql

# Import shared wrapper utilities
sys.path.insert(0, str(Path(__file__).parent))
from retry_wrapper import (
    find_solution,
    build_wrapped_code,
    run_testcase,
)

# ── paths ─────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path("/Users/capsfly/Desktop/gatecode")
INPUTS_DIR   = PROJECT_ROOT / "testcase-generator" / "regen_v2" / "inputs"
STAGE_DIR    = PROJECT_ROOT / "testcase-generator" / "regen_v2"
SKIPPED_FILE = STAGE_DIR / "STAGE_RETRY2_skipped.json"
ERRORS_FILE  = STAGE_DIR / "STAGE_RETRY2_errors.json"
STATUS_FILE  = STAGE_DIR / "STAGE_RETRY2.md"

# ── global state ──────────────────────────────────────────────────────────────
lock = threading.Lock()
stats = {
    'done': 0,
    'filled': 0,
    'skipped_no_sol': 0,
    'skipped_no_db': 0,
    'skipped_already': 0,
    'partial': 0,
    'error': 0,
}
skipped_log: list[dict] = []
errors_log: list[dict] = []
filled_pids: list[int] = []
start_time = time.time()


def get_db_conn():
    return pymysql.connect(
        host='127.0.0.1', port=3306, user='root', password='',
        database='gatecode', charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
    )


def load_db_cache(pids: list[int]) -> dict:
    """Load slug→{frontend_question_id, slug} mapping from DB for all PIDs."""
    slugs_needed = set()
    for pid in pids:
        try:
            d = json.loads((INPUTS_DIR / f'{pid}.json').read_text())
            s = d.get('slug', '')
            if s:
                slugs_needed.add(s)
        except:
            pass

    if not slugs_needed:
        return {}

    conn = get_db_conn()
    cur = conn.cursor()
    placeholders = ','.join(['%s'] * len(slugs_needed))
    cur.execute(
        f"SELECT frontend_question_id, slug, is_acm_mode FROM problems WHERE slug IN ({placeholders})",
        list(slugs_needed),
    )
    rows = cur.fetchall()
    conn.close()
    return {r['slug']: r for r in rows}


def process_pid(file_pid: int, db_cache: dict) -> str:
    """Process one file PID. Returns status string."""
    input_path = INPUTS_DIR / f'{file_pid}.json'
    try:
        data = json.loads(input_path.read_text())
    except Exception as e:
        with lock:
            stats['error'] += 1
            stats['done'] += 1
            errors_log.append({'file_pid': file_pid, 'reason': f'read_error: {e}'})
        return 'error'

    slug = data.get('slug', '')
    testcases = data.get('testcases', [])

    # Check if already filled (all outputs non-empty)
    if testcases and all(tc.get('output') not in (None, '') for tc in testcases):
        with lock:
            stats['skipped_already'] += 1
            stats['done'] += 1
        return 'already_done'

    # Look up real PID from DB
    if slug not in db_cache:
        with lock:
            stats['skipped_no_db'] += 1
            stats['done'] += 1
            skipped_log.append({'file_pid': file_pid, 'slug': slug, 'reason': 'not_in_db'})
        return 'no_db'

    db_row = db_cache[slug]
    real_pid = db_row['frontend_question_id']
    is_acm = db_row.get('is_acm_mode', 0)

    # Skip ACM mode problems (different input format)
    if is_acm:
        with lock:
            stats['skipped_no_sol'] += 1
            stats['done'] += 1
            skipped_log.append({'file_pid': file_pid, 'slug': slug, 'real_pid': real_pid, 'reason': 'acm_mode'})
        return 'no_sol'

    # Find Python solution
    solution_code = find_solution(real_pid)
    if not solution_code:
        with lock:
            stats['skipped_no_sol'] += 1
            stats['done'] += 1
            skipped_log.append({'file_pid': file_pid, 'slug': slug, 'real_pid': real_pid, 'reason': 'no_python_solution'})
        return 'no_sol'

    # Build wrapped code
    try:
        full_code = build_wrapped_code(solution_code)
    except Exception as e:
        with lock:
            stats['error'] += 1
            stats['done'] += 1
            errors_log.append({'file_pid': file_pid, 'slug': slug, 'real_pid': real_pid, 'reason': f'wrap_error: {e}'})
        return 'error'

    # Write to temp file and run
    tmp = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, prefix=f'gc2_{file_pid}_') as f:
            f.write(full_code)
            tmp = f.name

        # Run each testcase; continue on individual failures
        filled_tcs = []
        success_count = 0
        failure_count = 0
        tc_errors = []

        for i, tc in enumerate(testcases):
            tc_input = tc.get('input', '')
            # Skip if already has output
            if tc.get('output') not in (None, ''):
                filled_tcs.append(tc)
                success_count += 1
                continue

            out, err = run_testcase(tmp, tc_input, timeout=5)
            if err:
                tc_errors.append({'tc_idx': i, 'error': err, 'input': tc_input[:200]})
                filled_tcs.append(tc)  # keep without output
                failure_count += 1
            else:
                filled_tcs.append({**tc, 'output': out})
                success_count += 1

        total_tcs = len(testcases)
        if total_tcs == 0:
            with lock:
                stats['error'] += 1
                stats['done'] += 1
                errors_log.append({'file_pid': file_pid, 'slug': slug, 'real_pid': real_pid, 'reason': 'no_testcases'})
            return 'error'

        success_rate = success_count / total_tcs

        # Require >= 50% success to write back
        if success_rate < 0.5:
            with lock:
                stats['error'] += 1
                stats['done'] += 1
                errors_log.append({
                    'file_pid': file_pid, 'slug': slug, 'real_pid': real_pid,
                    'reason': f'low_success_rate_{success_count}/{total_tcs}',
                    'tc_errors': tc_errors[:5],
                })
            return 'error'

        # Write filled JSON back
        data['testcases'] = filled_tcs
        input_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))

        # Build DB test_cases JSON — only include fully filled tcs
        db_tcs = [
            {'input': tc['input'], 'output': tc['output']}
            for tc in filled_tcs
            if tc.get('output') not in (None, '')
        ]

        if not db_tcs:
            with lock:
                stats['error'] += 1
                stats['done'] += 1
                errors_log.append({'file_pid': file_pid, 'slug': slug, 'real_pid': real_pid, 'reason': 'all_tcs_failed'})
            return 'error'

        test_cases_json = json.dumps(db_tcs, ensure_ascii=False)

        # Update DB
        try:
            conn = get_db_conn()
            cur = conn.cursor()
            cur.execute(
                "UPDATE problems SET test_cases = %s, judge_enabled = 1 WHERE slug = %s",
                (test_cases_json, slug),
            )
            conn.commit()
            conn.close()
        except Exception as e:
            with lock:
                stats['error'] += 1
                stats['done'] += 1
                errors_log.append({'file_pid': file_pid, 'slug': slug, 'reason': f'db_update_error: {e}'})
            return 'error'

        if failure_count > 0:
            with lock:
                stats['partial'] += 1
                stats['filled'] += 1
                stats['done'] += 1
                filled_pids.append(file_pid)
            return 'partial'
        else:
            with lock:
                stats['filled'] += 1
                stats['done'] += 1
                filled_pids.append(file_pid)
            return 'filled'

    finally:
        if tmp and os.path.exists(tmp):
            try:
                os.unlink(tmp)
            except:
                pass


def git_commit_batch(pids_batch: list[int]):
    """Commit filled input files for a batch of PIDs."""
    if not pids_batch:
        return
    pids_sorted = sorted(pids_batch)
    n = len(pids_sorted)
    lo, hi = pids_sorted[0], pids_sorted[-1]

    files = [str(INPUTS_DIR / f'{p}.json') for p in pids_sorted]

    # Verify on main
    branch_result = subprocess.run(
        ['git', '-C', str(PROJECT_ROOT), 'branch', '--show-current'],
        capture_output=True, text=True,
    )
    branch = branch_result.stdout.strip()
    if branch != 'main':
        print(f"  [git] WARNING: not on main (got '{branch}'), skipping commit")
        return

    # Pull rebase first
    subprocess.run(
        ['git', '-C', str(PROJECT_ROOT), 'pull', '--rebase', 'origin', 'main'],
        capture_output=True, text=True,
    )

    # Stage files
    subprocess.run(['git', '-C', str(PROJECT_ROOT), 'add'] + files, check=False)

    msg = f"regen-v2 retry-2: filled outputs for {n} PIDs ({lo}-{hi})"
    result = subprocess.run(
        ['git', '-C', str(PROJECT_ROOT), 'commit',
         '-m', msg,
         '--author', 'RedInn7 <RedInn7@users.noreply.github.com>'],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        if 'nothing to commit' in result.stdout + result.stderr:
            print(f"  [git] nothing to commit for batch {lo}-{hi}")
            return
        print(f"  [git] commit failed: {result.stderr.strip()[:200]}")
        return

    # Push with retry
    for attempt in range(3):
        r = subprocess.run(
            ['git', '-C', str(PROJECT_ROOT), 'push', 'origin', 'main'],
            capture_output=True, text=True,
        )
        if r.returncode == 0:
            print(f"  [git] pushed batch {lo}-{hi} ({n} PIDs)")
            break
        print(f"  [git] push attempt {attempt+1} failed: {r.stderr.strip()[:100]}")
        time.sleep(5)


def write_logs():
    SKIPPED_FILE.write_text(json.dumps({'skipped': skipped_log}, indent=2))
    ERRORS_FILE.write_text(json.dumps({'errors': errors_log}, indent=2))


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--workers', type=int, default=24)
    parser.add_argument('--batch-size', type=int, default=25)
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--start-from', type=int, default=0)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    # Load retry PIDs > 1500
    pids_data = json.loads((STAGE_DIR / 'retry_output_pids.json').read_text())
    all_pids = sorted(p for p in pids_data['pids'] if p > 1500)
    if args.start_from:
        all_pids = [p for p in all_pids if p >= args.start_from]
    if args.limit:
        all_pids = all_pids[:args.limit]

    print(f"RetryGen-2: {len(all_pids)} PIDs to process (workers={args.workers})")

    # Load DB cache
    print("Loading DB cache...", flush=True)
    db_cache = load_db_cache(all_pids)
    print(f"DB cache loaded: {len(db_cache)} slugs mapped")

    if args.dry_run:
        print("DRY RUN: checking solutions only")
        found = sum(1 for p in all_pids[:50] if _dry_check(p, db_cache))
        print(f"Found solutions for {found}/50 sampled PIDs")
        return

    global start_time
    start_time = time.time()
    last_report = time.time()
    last_commit_time = time.time()

    consecutive_failures = 0
    batch_filled: list[int] = []
    pending_commit: list[int] = []

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(process_pid, pid, db_cache): pid for pid in all_pids}

        for future in as_completed(futures):
            pid = futures[future]
            try:
                status = future.result()
            except Exception as e:
                with lock:
                    stats['error'] += 1
                    stats['done'] += 1
                    errors_log.append({'file_pid': pid, 'reason': f'exception: {e}'})
                status = 'error'

            if status in ('filled', 'partial'):
                consecutive_failures = 0
                pending_commit.append(pid)
            elif status == 'error':
                consecutive_failures += 1
            else:
                consecutive_failures = 0

            # Halt check
            if consecutive_failures >= 30:
                print(f"HALTING: {consecutive_failures} consecutive failures!")
                break

            # Commit every batch-size filled PIDs
            if len(pending_commit) >= args.batch_size:
                batch = pending_commit[:args.batch_size]
                pending_commit = pending_commit[args.batch_size:]
                print(f"  [commit] batch of {len(batch)} PIDs")
                git_commit_batch(batch)

            # Progress every 5 min
            now = time.time()
            if now - last_report >= 300:
                last_report = now
                elapsed = now - start_time
                with lock:
                    s = dict(stats)
                total = len(all_pids)
                rate = s['done'] / elapsed * 60 if elapsed > 0 else 0
                eta = (total - s['done']) / (s['done'] / elapsed) if s['done'] > 0 else 0
                print(
                    f"[{elapsed/60:.1f}m] done={s['done']}/{total} "
                    f"filled={s['filled']} partial={s['partial']} "
                    f"skipped_nosol={s['skipped_no_sol']} err={s['error']} "
                    f"rate={rate:.0f}/min ETA={eta/60:.1f}m"
                )
                write_logs()

    # Final commit for remaining
    if pending_commit:
        print(f"  [commit] final batch of {len(pending_commit)} PIDs")
        git_commit_batch(pending_commit)

    # Write final logs
    write_logs()

    elapsed = time.time() - start_time
    with lock:
        s = dict(stats)

    summary = f"""# RetryGen-2 Final Report

## Stats
- Total PIDs: {len(all_pids)}
- Filled: {s['filled']} (includes {s['partial']} partial)
- Skipped (no sol): {s['skipped_no_sol']}
- Skipped (no DB): {s['skipped_no_db']}
- Skipped (already done): {s['skipped_already']}
- Errors: {s['error']}
- Elapsed: {elapsed/60:.1f} minutes

## Status
{'DONE' if consecutive_failures < 30 else 'HALTED (consecutive failures)'}
"""
    STATUS_FILE.write_text(summary)
    print(summary)


def _dry_check(pid: int, db_cache: dict) -> bool:
    try:
        data = json.loads((INPUTS_DIR / f'{pid}.json').read_text())
        slug = data.get('slug', '')
        if slug not in db_cache:
            return False
        real_pid = db_cache[slug]['frontend_question_id']
        return find_solution(real_pid) is not None
    except:
        return False


if __name__ == '__main__':
    main()
