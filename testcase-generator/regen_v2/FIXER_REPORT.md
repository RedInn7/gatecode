# Fixer F1 Report — 20 STUCK PIDs

Processed: 2026-05-16
Outcomes: 19 FIXED, 1 FALSE-POSITIVE, 0 DISABLED

---

## PID 49 (root-equals-sum-of-children)
**Outcome**: FIXED
**Real constraints**: Node.val in [-100, 100]
**Audit said**: arr[0]=-1000 < value_min=-100.0 (and 66+ more violations)
**Action**: Clamped all tree node values to [-100, 100] using random in-range replacement for out-of-range values.

---

## PID 155 (split-linked-list-in-parts)
**Outcome**: FIXED
**Real constraints**: Node.val in [0, 1000], k in [1, 50]
**Audit said**: arr[0]=-537 < value_min=0.0 (and 43+ more violations)
**Action**: Replaced all negative node values with random values in [0, 1000].

---

## PID 173 (maximum-binary-tree-ii)
**Outcome**: FIXED
**Real constraints**: Node.val in [1, 100], all values unique; val in [1, 100], val not in tree
**Audit said**: arr[0]=-1000 < value_min=1.0 (and 92+ more violations)
**Action**: Clamped all tree values to [1, 100], enforced uniqueness (de-duplicated), ensured inserted `val` is not already in tree.

---

## PID 196 (make-array-empty)
**Outcome**: FALSE-POSITIVE
**Real constraints**: nums[i] in [-10^9, 10^9]
**Audit said**: arr[0]=-486236452 < value_min=-109.0
**Action**: No change. The audit parser failed to strip `<sup>9</sup>` tags, reading `-10^9` as `-109`. The actual minimum is -1,000,000,000, and -486236452 is well within bounds. File left unchanged.

---

## PID 201 (collect-coins-in-a-tree)
**Outcome**: FIXED
**Real constraints**: coins[i] in [0, 1]
**Audit said**: arr[0]=529 > value_max=1.0 (and hundreds of violations)
**Action**: Replaced all out-of-range coin values: negatives → 0, values > 1 → 1.

---

## PID 217 (even-odd-tree)
**Outcome**: FIXED
**Real constraints**: Node.val in [1, 10^6]
**Audit said**: arr[0]=-838 < value_min=1.0 (and 43+ more violations)
**Action**: Replaced all negative/zero tree node values with random values in [1, 1000000].

---

## PID 261 (find-the-minimum-and-maximum-number-of-nodes-between-critical-points)
**Outcome**: FIXED
**Real constraints**: Node.val in [1, 10^5]
**Audit said**: arr[0]=-1000 < value_min=1.0
**Action**: Replaced out-of-range linked list values with random values in [1, 100000].

---

## PID 330 (deepest-leaves-sum)
**Outcome**: FIXED
**Real constraints**: Node.val in [1, 100]
**Audit said**: arr[0]=-833 < value_min=1.0 (and 948+ more violations)
**Action**: Replaced all negative/zero tree node values with random values in [1, 100].

---

## PID 379 (count-nodes-equal-to-average-of-subtree)
**Outcome**: FIXED
**Real constraints**: Node.val in [0, 1000]
**Audit said**: arr[2]=-129 < value_min=0.0 (and 60+ more violations)
**Action**: Replaced all negative tree node values with random values in [0, 1000].

---

## PID 422 (partition-list)
**Outcome**: FIXED
**Real constraints**: Node.val in [-100, 100], x in [-200, 200]
**Audit said**: arr[0]=675 > value_max=100.0 (and 900+ more violations)
**Action**: Clamped all node values to [-100, 100] and x values to [-200, 200].

---

## PID 445 (maximum-total-from-optimal-activation-order)
**Outcome**: FIXED
**Real constraints**: value[i] in [1, 10^5], limit[i] in [1, n]
**Audit said**: arr[0]=-1000 < value_min=1.0 (hundreds of violations across many testcases)
**Action**: Replaced all negative/zero values in value[] array with random values in [1, 100000]; clamped limit[] values to [1, n].

---

## PID 457 (final-element-after-subarray-deletions)
**Outcome**: FIXED
**Real constraints**: nums[i] in [1, 10^5]
**Audit said**: arr[0]=990594999 > value_max=100000.0 (and 5000+ more violations)
**Action**: Clamped all values exceeding 100000 down to random values in [1, 100000].

---

## PID 504 (cousins-in-binary-tree)
**Outcome**: FIXED
**Real constraints**: Node.val in [1, 100], all values unique; x and y must exist in tree, x != y
**Audit said**: arr[0]=-1000 < value_min=1.0, arr[0]=828 > value_max=100.0 (and 30+ more violations)
**Action**: Clamped tree values to [1, 100]; replaced two testcases with malformed inputs (x==y, single-node tree, non-unique values) with structurally correct alternatives; ensured x and y are valid distinct node values in each tree.

---

## PID 538 (reverse-nodes-in-even-length-groups)
**Outcome**: FIXED
**Real constraints**: Node.val in [0, 10^5]
**Audit said**: arr[0]=-428 < value_min=0.0 (and 27+ more violations)
**Action**: Replaced all negative node values with random values in [0, 100000].

---

## PID 544 (maximize-count-of-distinct-primes-after-split)
**Outcome**: FIXED
**Real constraints**: nums[i] in [1, 10^5], queries[i][0] in [0, n-1], queries[i][1] in [1, 10^5]
**Audit said**: arr[2]=-253 < value_min=1.0 (and 500+ more violations)
**Action**: Replaced all negative nums values with random values in [1, 100000]; clamped query indices and values to valid ranges.

---

## PID 604 (find-nearest-right-node-in-binary-tree)
**Outcome**: FIXED
**Real constraints**: Node.val in [1, 10^5], all values distinct; u must be a node in the tree
**Audit said**: arr[37]=-11 < value_min=1.0 (and 60+ more violations)
**Action**: Replaced all negative/zero tree values with random values in [1, 100000]; ensured u references a valid node in each fixed tree.

---

## PID 662 (best-team-with-no-conflicts)
**Outcome**: FIXED
**Real constraints**: scores[i] in [1, 10^6], ages[i] in [1, 1000]
**Audit said**: arr[0]=474214 > value_max=1000.0 (and 1000+ more violations across scores and ages arrays)
**Action**: The audit correctly identified that scores values like 474214 exceed 1000, but note the real constraint is scores[i] <= 10^6 — the value_max=1000 in the audit was for ages[i] NOT scores[i]. However, scores like 474214 are within [1, 10^6]. The ages array had values > 1000 (audit mixed up arrays). Fixed ages to [1, 1000] and scores to [1, 1000000].

---

## PID 709 (maximum-average-subtree)
**Outcome**: FIXED
**Real constraints**: Node.val in [0, 10^5]
**Audit said**: arr[2]=-289 < value_min=0.0 (and 500+ more violations)
**Action**: Replaced all negative tree node values with random values in [0, 100000].

---

## PID 715 (binary-tree-right-side-view)
**Outcome**: FIXED
**Real constraints**: Node.val in [-100, 100]
**Audit said**: arr[0]=645 > value_max=100.0 and arr[2]=-330 < value_min=-100.0 (and 16+ more violations)
**Action**: Clamped all tree node values to [-100, 100].

---

## PID 723 (maximum-product-of-splitted-binary-tree)
**Outcome**: FIXED
**Real constraints**: Node.val in [1, 10^4]
**Audit said**: arr[0]=-571 < value_min=1.0 (and 500+ more violations)
**Action**: Replaced all negative/zero tree node values with random values in [1, 10000].

---

## Summary
| Outcome | Count | PIDs |
|---------|-------|------|
| FIXED | 19 | 49, 155, 173, 201, 217, 261, 330, 379, 422, 445, 457, 504, 538, 544, 604, 662, 709, 715, 723 |
| FALSE-POSITIVE | 1 | 196 |
| DISABLED | 0 | — |
