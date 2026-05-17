# RetryGen-2 Final Report

## Mission
Fill outputs for PIDs > 1500 in retry_output_pids.json (564 PIDs total).

## Stats (combined: test run 50 + main run 516)
- Test run (first 50 PIDs): filled=20, skip_nosol=2, errors=28
- Main run (start-from 1660, 516 PIDs): filled=212, skip_nosol=126, errors=178
- **Total filled in DB: 231 unique problems**
- Total skipped (no Python solution): 85
- Total skipped (ACM mode): 41
- Elapsed: ~18 minutes total

## Git Commits Made
- regen-v2 retry-2: filled outputs for 2 PIDs (1503-1505)
- regen-v2 retry-2: filled outputs for 20 PIDs (1503-1660)
- regen-v2 retry-2: filled outputs for 25 PIDs (1698-2027)
- regen-v2 retry-2: filled outputs for 25 PIDs (1755-2266)
- regen-v2 retry-2: filled outputs for 25 PIDs (1776-2634)
- regen-v2 retry-2: filled outputs for 25 PIDs (1770-2806)
- regen-v2 retry-2: filled outputs for 25 PIDs (2799-3131)
- regen-v2 retry-2: filled outputs for 25 PIDs (1660-3276)
- regen-v2 retry-2: filled outputs for 25 PIDs (2405-3485)
- regen-v2 retry-2: filled outputs for 25 PIDs (3217-3758)
- regen-v2 retry-2: filled outputs for 12 PIDs (3092-3840)

## Why ~333 PIDs remained unfilled
1. **Invalid test inputs (errors)**: ~178 PIDs had test inputs violating problem constraints
   (e.g., negative values for positive-only arrays, invalid format strings, out-of-range indices).
   These failed at <50% success threshold.
2. **No Python solution**: 85 PIDs have no Python solution in SOL1/SOL2 repos.
3. **ACM mode**: 41 PIDs are ACM mode (different input format, not supported by this wrapper).

## Files Created
- testcase-generator/regen_v2/retry_wrapper.py (shared utility)
- testcase-generator/regen_v2/retry_gen2.py (main script)
- testcase-generator/regen_v2/STAGE_RETRY2_skipped.json
- testcase-generator/regen_v2/STAGE_RETRY2_errors.json

## Status
DONE
