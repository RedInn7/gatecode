# regen_v2 — 测试数据全量重生 Pipeline

完全 LLM 路线，重新生成 ~3417 道启用题的测试数据，C++ vs Python 双语交叉验证。

## 流水线 6 个 Stage

| Stage | 任务 | 并行度 | 产出目录 |
|-------|------|--------|---------|
| A | 生成 input（per-problem LLM） | 2 agents | `inputs/<pid>.json` |
| B | LLM 验证 + 自修 | 2 agents | `inputs_validated/<pid>.json` |
| C | 逐题终审，批准/驳回 | 2 agents | `approved_pids_F<N>.txt`、`rejected_by_C.json` |
| D | 通过 judge API 跑 C++ 参考解收 expected output | 4 agents | `finalized/<pid>.json` |
| E | Python 参考解跑同样 inputs 对比 | 4 agents | `divergences/<pid>.json`、`cross_validated.txt` |
| F | 逐条调查 C++ vs Python 不一致根因 | 1 agent | `divergence_analysis.md` |

每 stage 的 agent 都写 `STAGE_<X>_<agent>.md` 汇报：完成 PID、剩余 PID、跳过 PID + 原因。

## PID 分配

`problems.id`（DB 主键，非 LeetCode 题号）范围 [1, 3845]，启用 3417 题。中位数 `id=1909`。

- **前半段**：`id` ∈ [1, 1909]
- **后半段**：`id` ∈ [1910, 3845]

## 数据格式

### `inputs/<pid>.json`（Stage A）

```json
{
  "pid": 1,
  "slug": "two-sum",
  "inferred_constraints": "n ∈ [2, 10000], nums[i] ∈ [-1e9, 1e9]",
  "input_format": "first line: nums (JSON array); second line: target",
  "testcases": [
    {"input": "[2,7,11,15]\n9", "desc": "Edge: minimum n=2"},
    {"input": "[1,2,3,4,5,6,7,8,9,10]\n11", "desc": "Standard: small random"}
  ]
}
```

### `finalized/<pid>.json`（Stage D）

```json
{
  "pid": 1, "slug": "two-sum",
  "cases": [
    {"input": "[2,7,11,15]\n9", "cpp_output": "[0,1]", "desc": "..."}
  ]
}
```

### `divergences/<pid>.json`（Stage E）

```json
{
  "pid": 1, "slug": "two-sum",
  "divergent_cases": [
    {"idx": 5, "input": "...", "cpp_output": "[0,1]", "py_output": "[1,0]",
     "diff_type": "order_difference"}
  ]
}
```

## 关键约束

- **本 batch 不改 DB**。所有产物在磁盘
- **不开新分支**，所有 commit 直接 push `main`
- agent push 前必 `git fetch origin main && git rebase origin/main`
- **禁用** 所有旧 `testcase-generator/*.py` 生成脚本
- 每 50 题增量 commit，rate limit 也不丢工作
- 提交者 RedInn7
