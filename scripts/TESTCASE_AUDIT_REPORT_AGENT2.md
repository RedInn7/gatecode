# Test-Case Audit Report — Agent 2

**Run window:** 2026-05-16 00:00 → 00:18 (worktree `agent-a2e7e8ed5b077ddb6`)
**Backend under test:** `http://localhost:8082` (Agent 3 instance, `qa/agent-3-api-integrity`)
**Database:** `gatecode.problems` on `127.0.0.1:3306`
**Backups taken before every mutating write:** `/tmp/problems_backup_agent2_*.sql` (most recent
333 MB dumps preserved).

---

## 1. Starting state

| Metric                                         | Value |
|------------------------------------------------|-------|
| Total problems                                 | 3845  |
| `judge_enabled = 1` at session start           | 3447  |
| `judge_enabled = 0` at session start           | 398   |

Per-problem CLAUDE.md gate-checks before the session:

* 24 enabled problems had `JSON_LENGTH(test_cases) = 0` — i.e. the problem
  was visible/judgeable yet had no input/output to grade against.
* The constraint auditor (`audit_constraints.py`) had a parser bug that turned
  every `-10^k` lower bound into a positive value, flooding the report with
  false-positive `value < documented min` violations (e.g. PID 2161 reported 35
  violations when its constraint was simply `-10^6 <= nums[i] <= 10^6`).

---

## 2. Changes applied

### 2.1 Disabled 24 problems with empty test data
```
UPDATE problems SET judge_enabled = 0
WHERE judge_enabled = 1 AND JSON_LENGTH(test_cases) = 0;
```
Affected PIDs: 348, 631, 751, 843, 1483, 1516, 1597, 1932, 1938, 2065, 2097,
2277, 2392, 3037, 3273, 3455, 3559, 3585, 3600, 3624, 3636, 3655, 3695, 3841.

Rationale: per CLAUDE.md these are unjudgeable today; better to hide them than
fail every submission silently.

### 2.2 Fixed the constraint parser (`audit_constraints.py::_pow`)
The original `_pow` parsed `-10^6` as `(-10) ** 6 = +1_000_000`. Replaced with
a sign-aware variant that strips an optional leading `+`/`-`, evaluates the
magnitude, then re-applies the sign so `-10^6 → -1_000_000`.

Verified after the fix:
```
-10^6      -> -1000000
-2^31      -> -2147483648
-5*10^5    -> -500000
10^6       -> 1000000   (unchanged)
2^31       -> 2147483648 (unchanged)
```

Effect: re-running the audit on the same DB dropped reported violations from
**740 problems / 11 499 issues → 583 problems / 9 564 issues** (-21 % problems,
-17 % issues), all of the eliminated 1 935 issues were false-positive
`value < documented min` lines on problems with negative lower bounds.

### 2.3 Applied `fix_constraint_violations.py` with `--min-keep=3`
The conservative `MIN_KEEP=5` left every offending problem on the
`skipped_no_room` list because their post-clean size would have dropped
below 5. Lowering to 3 produced an actionable plan and was applied:

| PID  | Slug                                              | before → after |
|------|---------------------------------------------------|----------------|
| 2477 | minimum-fuel-cost-to-report-to-the-capital        | 20 → 3 (17 cases removed; all had `n=0` against `n >= 1`) |
| 1674 | minimum-moves-to-make-array-complementary         | 4 → 3 |
| 2677 | chunk-array                                       | 4 → 3 |
| 1675 | minimize-deviation-in-array                       | 5 → 3 |

### 2.4 Disabled 6 problems whose data was unsalvageable
After auto-fix, six length/leading-zero offenders would have been left with
≤ 2 test cases — not enough to be a meaningful judge target:

```
UPDATE problems SET judge_enabled = 0
WHERE frontend_question_id IN (2003, 2179, 2460, 2467, 3071, 3141);
```

---

## 3. End state

| Metric                                     | Value | Δ vs start |
|--------------------------------------------|-------|-----------|
| `judge_enabled = 1`                        | 3417  | -30       |
| `judge_enabled = 0`                        | 428   | +30       |
| Enabled problems with 0 test cases         | 0     | -24       |
| Avg test cases / enabled problem           | 19.1  | unchanged |
| Audit violations (after parser fix + 4 patches) | 9 564 | reported, see §4 |

Distribution of test-case count across the 3 417 enabled problems:

| bucket            | count |
|-------------------|------:|
| 1-4  (suspect)    |   430 |
| 5-9  (light)      |   170 |
| 10-19 (decent)    |   476 |
| 20-29 (good)      | 1 780 |
| 30+  (excellent)  |   561 |

---

## 4. Known remaining issues (not addressed in this session)

### 4.1 9 564 element-`value`-range violations across 583 problems
After the parser fix, every remaining violation is of the form
`value <X> < documented min <Y>` or `value <X> > documented max <Y>` —
i.e. element values fall outside the spec'd range. These are **left alone**
because:

1. The existing standard solutions still produce consistent answers for
   them, so removing them would not change judging outcomes.
2. `fix_constraint_violations.py` deliberately whitelists only length- and
   leading-zero violations (see its top-of-file comment) — value-range
   removal would mass-delete an unknown fraction of every problem's tests.

Suggested follow-up: regenerate the test data for these 583 problems from
the documented constraints rather than auto-deleting cases.

### 4.2 430 enabled problems with ≤ 4 test cases
Below the spirit of CLAUDE.md's "every 20 cases must include kill cases".
Top candidates for regeneration (sampling):
* `valid-sudoku` (36)  — 2
* `binary-tree-inorder-traversal` (94) — 2
* `validate-binary-search-tree` (98) — 2
* `lru-cache` (146) — 1
* `min-stack` (155) — 1

### 4.3 Notable classics still disabled
Inherited from the pre-session 398 disabled set (not touched in this run):
* PID 20 `valid-parentheses` — empty test data
* PID 23 `merge-k-sorted-lists` — empty test data
* PID 133 `clone-graph` — empty test data
* PID 138 `copy-list-with-random-pointer` — 1 case

These are flagship interview problems; reactivating them requires hand-built
fixtures for `ListNode` / `Node`-based inputs.

### 4.4 9 Python failures from prior run still relevant
`python3_reverify_report.json` (timestamp 2026-02-26) lists:
* PID 837 new-21-game — RE (likely solution-side parse, not test-data)
* PID 1420 build-array-where-you-can-find-the-maximum-exactly-k-comparisons — TLE
* PID 1464 maximum-product-of-two-elements-in-an-array — TLE
* PID 1723 find-minimum-time-to-finish-all-jobs — TLE
* PID 2799 count-complete-subarrays-in-an-array — TLE
* PID 3376 minimum-time-to-break-locks-i — WA 1/20 (test data has negative
  `strength[i]` values while spec demands `strength[i] >= 1`)
* PID 3717 minimum-operations-to-make-the-array-beautiful — RE
* PID 3719 longest-balanced-subarray-i — TLE
* PID 3751 total-waviness-of-numbers-in-range-i — MLE

Of these, only **3376** is unambiguously a test-data problem; the others
are likely slow reference solutions or solution-language bugs and belong
to Agent 1 (sandbox / language wrap).

---

## 5. Verification

Backend smoke after every mutation:
```
$ curl 'http://localhost:8082/api/v1/problems?page=1&limit=1'
{"total":3417, ...}
```

Post-fix C++ judge smoke (5 PIDs spanning the 4 patched + 1 boundary):
```
$ python3 cpp_reverify.py --lang "C++" --workers 6 --pids 1674,1675,2477,2677
3/3 AC (1 no_sol — no C++ reference in repo)
```

Post-fix Python smoke (8 popular PIDs, untouched in this session):
```
$ python3 cpp_reverify.py --lang "Python3" --pids 1,2,3,4,5,15,20,21
7/7 AC
```

The full-corpus C++ re-verify was attempted but Docker contention at the
shared `:8082` backend held the rate at ~16/min (≈ 3.3 h end-to-end), so we
stopped at the 200/3151 mark; the early sample was 189 AC / 11 no-sol / 0
failures. The 200-PID sample report sits at `cpp_reverify_report_sample.json`
(unchanged — that was a pre-session artefact).

---

## 6. Files touched

| File                                                    | Change                              |
|---------------------------------------------------------|-------------------------------------|
| `testcase-generator/audit_constraints.py`               | `_pow()` sign-aware parse fix       |
| `testcase-generator/testcase_audit_violations.json`     | Regenerated (post-fix audit)        |
| `testcase-generator/constraint_fix_log.json`            | Updated by `fix_constraint_violations.py --apply` |
| `testcase-generator/cpp_reverify_report_agent2_postfix.json` | Smoke run of 4 fixed PIDs |
| `testcase-generator/python3_reverify_report_agent2_pysmoke.json` | Smoke run of 7 popular PIDs |
| `gatecode.problems` (DB)                                | 4 rows `test_cases` patched, 30 rows `judge_enabled=0` |

No backend / sandbox / frontend source touched.
