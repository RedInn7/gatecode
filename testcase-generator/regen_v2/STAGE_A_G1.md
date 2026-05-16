# Stage A1 — Agent A1 Status Report

## Summary

**Agent**: A1 (Wave 1 Stage A, generation)
**Range**: `problems.id` ∈ [1, 1909] with `judge_enabled=1` (1709 problems)
**Completed**: 105 problems
**Skipped** (in `skipped_by_A1.json`): 5 problems
**Remaining**: 1604 problems (1709 - 105 = 1604)

## Methodology

Per task instructions, every JSON was hand-crafted by LLM reasoning (no generator scripts). Each problem:
1. Read HTML `content` from MySQL `problems` table to understand semantics, constraints, I/O format
2. Looked at `template_code` Python3 method signature to confirm parameter order/types
3. Produced 20 testcases per problem covering:
   - ≥5 edge cases (n=0/1/min/max, empty, single, all-same, monotonic, extreme values)
   - ≥10 standard cases (mixed distributions, varied sizes)
   - ≥3 stress cases (max-scale near constraint boundary)
   - ≥2 problem-specific killer cases

Input format follows LeetCode convention: JSON arrays/strings, one parameter per line.

## Skipped Problems (cannot run in cross-lang judge)

See `skipped_by_A1.json`. Reasons:
- PID 53 `differences-between-two-objects` — JS/TS only, no C++/Python templates
- PID 71 `customer-purchasing-behavior-analysis` — SQL problem, Python3 template NULL
- PID 74 `serialize-and-deserialize-n-ary-tree` — Codec with non-unique output
- PID 111 `find-the-index-of-the-large-integer` — Interactive ArrayReader API
- PID 113 `diameter-of-n-ary-tree` — N-ary Node class, complex deserialization

## Completed PIDs (105)

```
1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23,
24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 54, 55, 56, 57, 58, 59, 60, 61,
62, 63, 64, 65, 66, 67, 68, 69, 70, 72, 73, 75, 76, 77, 79, 80, 81, 82,
83, 84, 85, 86, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
102, 103, 104, 105, 106, 107, 108, 109, 110, 112, 114, 115, 116
```

## Commits Pushed to main

- `regen-v2 stage A1: generate inputs for PIDs 1-54 (49 problems, 1 skipped JS-only)`
- `regen-v2 stage A1: generate inputs for PIDs 55-73 (17 problems, 2 skipped SQL/Codec)`
- `regen-v2 stage A1: generate inputs for PIDs 75-96 (20 problems)`
- `regen-v2 stage A1: generate inputs for PIDs 97-106 (10 problems)`
- `regen-v2 stage A1: generate inputs for PIDs 107-116 (8 problems, 2 skipped)`

## Remaining PIDs (1604, sample)

First 30: 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, ...

Full list saved to MySQL query:
```sql
SELECT id, slug, content, template_code FROM gatecode.problems
WHERE judge_enabled=1 AND id BETWEEN 117 AND 1909 ORDER BY id;
```

## Halt Reason

Context budget approaching limit after generating 105 problems. Each problem requires substantial output (~2-3 KB JSON + reading ~5-10 KB HTML), making further bulk generation impractical in current session.

## Pickup Instructions for Continuation Agent

1. Check `inputs/` for existing PIDs (do not re-generate)
2. Start at PID 117 (or wherever max(completed) + 1 is)
3. Follow same format and methodology
4. Commit every 50 problems to main with descriptive message
5. Update `skipped_by_A1.json` (or use separate file) for problems that can't be judged
6. Skip patterns observed:
   - SQL-only problems (Python3 template NULL)
   - Interactive problems (have explicit "API"/"reader" interfaces in description)
   - JavaScript-only problems (only JS/TS in template_code keys)
   - Codec/Serialize problems with non-unique outputs

## A1-r2 (接力第 2 轮 — 2026-05-15/16)

Generated ~100 problems in [117, 315] range. Many were also picked up and committed
in parallel by A2-r2 agents (since they share the same `inputs/` directory and one
A2 agent was inadvertently grabbing all newly-written files regardless of PID range).

New skips added in this round:
- 148 (query-batching JS async), 172 (codec n-ary tree), 178 (JS only)
- 185 (word-squares-ii non-unique), 190 (n-ary tree node), 198 (JS only)
- 230 (generate-schedule non-unique), 232 (letter-case-permutation order)
- 239 (random-pick-index), 244 (longest-palindromic-substring non-unique)
- 253 (frequencies-of-shortest-supersequences), 264 (JS generator)
- 281 (reorganize-string non-unique), 282 (random-flip-matrix)
- 290 (JS immutable), 317 (longest-happy-string non-unique)

Current state at session end:
- 353 PIDs in [1, 1909] have inputs JSON
- ~1430 still TODO in range
- 16+ skips total

Commits pushed this round:
- `regen-v2 stage A1-r2: generate inputs for PIDs 226-242 (13 problems, 3 skipped)`
- `regen-v2 stage A1-r2: generate inputs for PIDs 273-274 (final batch leftover)`
- `regen-v2 stage A1-r2: generate inputs for PIDs 302-307 (6 problems)`
- `regen-v2 stage A1-r2: generate inputs for PIDs 308-315 (5 problems committed here)`

## A1-r4 (接力第 4 轮 — 2026-05-16)

Focused on middle gap [316, 1791]. Started with 6 done out of 1310 candidates.
Generated 170 new input JSON files this session.

### Final counts
- Done in middle range [316, 1791]: 194 / 1310 (15%)
- Skipped (A1+A2 union) in [316,1791]: ~67
- Remaining in middle range: ~1083

### New skips added (in [316, 1791] range)
- 317 (longest-happy-string non-unique)
- 318, 385, 466, 539 (design classes)
- 328, 482, 510, 609, 619, 721, 758 + others (JS only) — auto-detected
- 356, 366, 389, 397 (interactive APIs)
- 382 (TreeNode reference identity)
- 395 (any-peak non-unique)
- 396 (BST list)
- 408 (any optimal split)
- 439 (any shortest superstring)
- 455 (BST delete non-unique)
- 531 (BST construction non-unique)
- 656 (Bash only — auto detected)

### Commits pushed this round
- Batches of ~10-12 PIDs each, ~17 commits in [319, 548] range
- All pushed directly to origin/main with no merge conflicts
- Range covered: 319, 320, 322-327, 330, 333-338, 340, 341, 343, 344,
  347, 348, 350-355, 357-365, 367-373, 375-377, 379, 381, 383, 384, 386-388,
  390-394, 398-407, 409-432, 433-456, 457-468, 469-480, 481-505, 506-548

### Halt reason
Context budget approaching limit after ~170 new problems in single session.
Next agent should resume at PID 550+ (skip 549 which is already covered in some range).

### Pickup hint
Run:
```bash
ls testcase-generator/regen_v2/inputs/*.json | xargs -n1 basename | sed 's/.json//' | sort -n > /tmp/done.txt
mysql -uroot gatecode -e "SELECT id FROM problems WHERE judge_enabled=1 AND id BETWEEN 549 AND 1791 ORDER BY id;" -BN > /tmp/all.txt
# Filter out done and skipped from /tmp/all.txt
```
