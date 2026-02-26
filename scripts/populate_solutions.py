#!/usr/bin/env python3
"""Populate problems.solutions and problems.editorial from solution repos.

Reads C++/Java/Python3 code from Sol1/Sol2, extracts editorial from
README_EN.md (between <!-- solution:start --> and <!-- tabs:start -->),
and writes JSON to MySQL.

Usage:
    python3 populate_solutions.py                  # dry-run (print stats)
    python3 populate_solutions.py --write          # actually write to DB
    python3 populate_solutions.py --write --pid 1  # single problem
"""

import argparse
import json
import re
import pymysql
import sys
from pathlib import Path

SOL1_BASE = Path("/Users/capsfly/Desktop/gatecode/leetcode solution/solution 1/solution")
SOL2_BASE = Path("/Users/capsfly/Desktop/gatecode/leetcode solution/solution 2")

# language -> (langKey for frontend, file extension, Sol1 filename, Sol2 subdirectory)
LANGUAGES = {
    "C++":     {"langKey": "cpp",     "ext": ".cpp",  "sol1_file": "Solution.cpp",  "sol2_dir": "C++"},
    "Java":    {"langKey": "java",    "ext": ".java", "sol1_file": "Solution.java", "sol2_dir": "Java"},
    "Python3": {"langKey": "python3", "ext": ".py",   "sol1_file": "Solution.py",   "sol2_dir": "Python"},
}


def find_sol1_dir(pid: int) -> Path | None:
    """Find the Sol1 problem directory (e.g., 0000-0099/0001.Two Sum/)."""
    rng = f"{pid // 100 * 100:04d}-{pid // 100 * 100 + 99:04d}"
    parent = SOL1_BASE / rng
    if not parent.exists():
        return None
    prefix = f"{pid:04d}."
    for d in parent.iterdir():
        if d.is_dir() and d.name.startswith(prefix):
            return d
    return None


def read_solution_code(pid: int, slug: str, lang_info: dict) -> str | None:
    """Try to read solution code from Sol1 first, then Sol2."""
    # Sol1: structured directory
    sol1_dir = find_sol1_dir(pid)
    if sol1_dir:
        f = sol1_dir / lang_info["sol1_file"]
        if f.exists():
            code = f.read_text(errors="replace").strip()
            if len(code) > 20:
                return code

    # Sol2: flat by language, slug-based filenames
    sol2_file = SOL2_BASE / lang_info["sol2_dir"] / f"{slug}{lang_info['ext']}"
    if sol2_file.exists():
        code = sol2_file.read_text(errors="replace").strip()
        if len(code) > 20:
            return code

    return None


def extract_editorial(pid: int) -> str | None:
    """Extract editorial text from README_EN.md.

    Grabs content between <!-- solution:start --> and <!-- tabs:start -->.
    This is the explanation text before the code blocks.
    """
    sol1_dir = find_sol1_dir(pid)
    if not sol1_dir:
        return None

    readme = sol1_dir / "README_EN.md"
    if not readme.exists():
        return None

    content = readme.read_text(errors="replace")

    # Extract between <!-- solution:start --> and <!-- tabs:start -->
    m = re.search(
        r'<!--\s*solution:start\s*-->(.*?)<!--\s*tabs:start\s*-->',
        content,
        re.DOTALL,
    )
    if not m:
        return None

    editorial = m.group(1).strip()

    # Remove the "### Solution 1:" header prefix if it's the only solution
    # Keep it if there are multiple solutions
    # Skip stub editorials that are just a header with no real explanation
    if editorial and len(editorial) > 30:
        return editorial

    return None


def build_solutions_json(pid: int, slug: str) -> list[dict] | None:
    """Build the solutions JSON array for a problem."""
    entries = []
    for lang_name, lang_info in LANGUAGES.items():
        code = read_solution_code(pid, slug, lang_info)
        if code:
            entries.append({
                "language": lang_name,
                "langKey": lang_info["langKey"],
                "code": code,
            })

    return entries if entries else None


def main():
    parser = argparse.ArgumentParser(description="Populate solutions/editorial into DB")
    parser.add_argument("--write", action="store_true", help="Actually write to DB (default is dry-run)")
    parser.add_argument("--pid", type=int, help="Process only this frontend_question_id")
    parser.add_argument("--host", default="127.0.0.1", help="MySQL host")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default="")
    parser.add_argument("--db", default="gatecode")
    args = parser.parse_args()

    conn = pymysql.connect(
        host=args.host, port=args.port, user=args.user,
        password=args.password, database=args.db,
        charset="utf8mb4",
    )
    cur = conn.cursor()

    # Fetch all problems
    if args.pid:
        cur.execute(
            "SELECT frontend_question_id, slug FROM problems WHERE frontend_question_id = %s",
            (args.pid,),
        )
    else:
        cur.execute("SELECT frontend_question_id, slug FROM problems ORDER BY frontend_question_id")

    rows = cur.fetchall()
    print(f"Processing {len(rows)} problems...")

    stats = {"solutions": 0, "editorial": 0, "skipped": 0, "no_code": 0}

    for i, (pid, slug) in enumerate(rows):
        solutions = build_solutions_json(pid, slug)
        editorial = extract_editorial(pid)

        if not solutions and not editorial:
            stats["no_code"] += 1
            continue

        if solutions:
            stats["solutions"] += 1
        if editorial:
            stats["editorial"] += 1

        if args.write:
            sol_json = json.dumps(solutions, ensure_ascii=False) if solutions else None
            cur.execute(
                "UPDATE problems SET solutions = %s, editorial = %s WHERE frontend_question_id = %s",
                (sol_json, editorial, pid),
            )

        if (i + 1) % 500 == 0:
            if args.write:
                conn.commit()
            print(f"  [{i+1}/{len(rows)}] solutions={stats['solutions']}, editorial={stats['editorial']}")

    if args.write:
        conn.commit()

    print(f"\nDone! Processed {len(rows)} problems.")
    print(f"  Solutions found: {stats['solutions']}")
    print(f"  Editorial found: {stats['editorial']}")
    print(f"  No code found:   {stats['no_code']}")
    if not args.write:
        print("\n  (DRY RUN — pass --write to actually update the DB)")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
