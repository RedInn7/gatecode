# Stage A Agent 2 (A2) — Progress Report

## Range
`problems.id` ∈ [1910, 3845], `judge_enabled=1`. Total: 1708 problems.

## Session 1 Progress

### Completed PIDs (134 generated)
1910-1916, 1918, 1919, 1921-1926, 1928-1935, 1937-1945, 1947-1951, 1953, 1954, 1956, 1957, 1960-1968, 1969-1976, 1978-1980, 1982-1992, 1994, 1996, 1998-2001, 2002-2008, 2010-2020, 2022-2037, 2039, 2041, 2043-2047, 2050-2053, 2055-2067

### Skipped (4 problems)
- 1952 fizz-buzz-multithreaded — multithreaded design problem
- 1997 number-of-unique-categories — interactive `CategoryHandler` API
- 2040 number-of-ships-in-a-rectangle — interactive `Sea.hasShips` API
- 2048 call-function-with-custom-context — JavaScript-only problem

### Remaining (~1570 problems)
PIDs roughly [2068, 3845] excluding any already in skipped list. Next agent should resume from PID 2068.

## Approach
- Each problem read individually for content + signature parsed for I/O format
- 20 testcases per file with edge/standard/stress distribution per `CLAUDE.md`:
  - Edge cases: n=0/1/min/max boundary, empty inputs, all-same elements, single element
  - Standard cases: random distribution, varied sizes
  - Stress cases: large valid inputs near constraint limits
  - Killer cases: alternating, palindromic, monotonic, extremes

## Helper Scripts (in work_A2/)
- `fetch_batch.py` — pulls problem data from MySQL, filters already-done & skipped PIDs
- `todo.tsv` — initial TODO list snapshot

## Notes for Next Agent
1. Backend was running on :8082 — restart with `cd backend && PORT=8082 go run ./cmd/api &` if needed
2. Use `python3 testcase-generator/regen_v2/work_A2/fetch_batch.py 1910 3845 N` to fetch next N problems
3. Skip and document any:
   - Interactive problems (API like `Sea`, `CategoryHandler`, `BinaryMatrix`)
   - JavaScript/SQL/Pandas/Bash-only
   - Multithreaded
4. Generate ACM-mode problems too (`is_acm_mode=1`), but format input lines per problem spec
5. **Do NOT** regenerate any PID already in `inputs/` (A1 covers 1-1909, A2 covers 1910-3845)
6. Commit every 30-50 problems with `git fetch origin main && git rebase origin/main && git add ... && git commit -m "regen-v2 stage A2: PIDs X-Y" && git push origin HEAD:main`
