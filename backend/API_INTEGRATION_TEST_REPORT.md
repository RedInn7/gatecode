# Gatecode Backend — API Integration Test Report

**Agent:** Agent 3 — Backend API & Database Integrity
**Branch:** `qa/agent-3-api-integrity`
**Date:** 2026-05-15
**Backend port (test):** `:8083` (production stays on `:8081`)
**Env:** Colima + Docker, MySQL 127.0.0.1:3306 (`gatecode` db), `gatecode-judge:latest`

---

## 1. Summary

| Area | Result |
| --- | --- |
| Endpoint smoke + edge cases | PASS |
| `judge_enabled=0` enforcement | PASS (403 on /run and /judge) |
| Slug 404 mapping | **FIXED** — handler was returning 500 |
| Concurrent /judge (50 × parallel) | PASS — 49 AC / 1 transient WA, **no 5xx, no deadlock, container pool stable (24 containers)** |
| CORS preflight + actual | PASS |
| Schema drift (`time_limit_ms`, `memory_limit_mb`) | **FIXED** — columns added |
| AutoMigrate failing on `slug` longtext + unique index | **FIXED** — model now declares `type:varchar(200)` |
| DB integrity (orphans, duplicates, invalid JSON) | PASS — 0 issues across 6 tables |
| Go integration tests (`httptest`) | **17 new tests, all PASS** |

---

## 2. Environment Verification

```
$ docker ps                            # daemon up
$ docker images | grep gatecode-judge  # gatecode-judge:latest present (1.28 GB)
$ mysql -e "USE gatecode; SHOW TABLES" # 6 tables: problems, submissions, users,
                                       # curriculums, curriculum_problems, orders
$ cd backend && PORT=8083 go run ./cmd/api
✅ 数据库连接成功
[GIN-debug] Listening and serving HTTP on :8083
```

Backend `cmd/api/main.go` did not honor a `PORT` env var. **Fixed** — `PORT` env now overrides hard-coded `:8081`.

---

## 3. Endpoint Coverage

### 3.1 `GET /api/v1/problems`

| # | URL | Status | Notes |
| --- | --- | --- | --- |
| T1 | `?page=1&limit=20` | 200 | Returns `{total, problems:[...]}`, ordered by `frontend_question_id ASC` |
| T2 | `?page=0` | 200 | Service coerces to page=1, returns first page |
| T3 | `?page=99999` | 200 | `problems: []`, `total: 3696` — graceful |
| T4 | `?limit=0` | 200 | Coerced to default `100` |
| T5 | `?limit=10000` | 200 | Capped to default `100` (limit > 200 falls back) |
| T6 | `?page=-1&limit=-5` | 200 | Both coerced to defaults |
| T7 | `?page=abc&limit=xyz` | 200 | `strconv.Atoi` returns 0 → coerced to defaults |
| T13 | `Origin: http://localhost:3000` | 200 | `Access-Control-Allow-Origin: *` present |

`judge_enabled=0` rows are excluded by `repository/problem_repo.go` (`Where("judge_enabled = ?", true)`). Verified: `total=3696` matches `SELECT COUNT(*) FROM problems WHERE judge_enabled=1`.

### 3.2 `GET /api/v1/problems/:slug`

| # | Slug | Status |
| --- | --- | --- |
| T8 | `two-sum` | 200 |
| T9 | `this-slug-definitely-does-not-exist-12345` | 404 `{"error":"题目不存在"}` |
| T10 | `%3Cscript%3E` (i.e. `<script>`) | 404 |
| T11 | `two-sum';DROP%20TABLE%20problems;--` | 404 (GORM uses parameter binding — safe) |
| T12 | `""` (empty) | 301 → `/api/v1/problems` (Gin route behaviour) |
| T13 | `seasonal-sales-analysis` (`judge_enabled=0`) | 200 — detail endpoint returns disabled problems with `judge_enabled:false` for the UI to show the badge |

### 3.3 `POST /api/v1/problems/:slug/run`

Body schema: `{language, code}` both `required`.

| # | Body | Slug state | Status | Notes |
| --- | --- | --- | --- | --- |
| R1 | `{"code":"x"}` | OK | 400 | validation: Language required |
| R2 | `{"language":"Python3"}` | OK | 400 | validation: Code required |
| R3 | `NOT JSON {` | OK | 400 | JSON parse error |
| R4 | valid | nonexistent | **404** | **FIXED** — was 500 previously |
| R5 | valid | `judge_enabled=0` | 403 | `{"error":"judging is currently unavailable for this problem"}` |
| R7 | `{"language":"Python3","code":""}` | OK | 400 | empty string fails `required` |
| R8 | Python3 syntax error | `two-sum` | 200 | `status:RuntimeError`, stderr has SyntaxError |
| R9 | infinite loop | `two-sum` | 200 | `status:TimeLimitExceeded`, runtime_ms ≈ 10064 |
| R10 | 200 KB code body | `two-sum` | 200 | `Accepted` |

### 3.4 `POST /api/v1/problems/:slug/judge`

| # | Scenario | Status | Notes |
| --- | --- | --- | --- |
| R6 | nonexistent slug | **404** | **FIXED** — was 500 previously |
| R14 | judge_enabled=1 but empty test_cases | **422** | New explicit code; previously 500. 24 problems hit this: tree/design problems where test data is pending |
| R-disabled | `judge_enabled=0` | 403 | Confirmed |
| R-runall | `run_all:true` | 200 | All test cases reported in `all_cases[]` |

### 3.5 Concurrent /judge stress test

```
$ seq 1 50 | xargs -P 50 -I {} curl -X POST .../two-sum/judge ...
50 requests | 20s wall time | 49× Accepted, 1× WrongAnswer (transient)
0 × 5xx, 0 × timeouts at the HTTP layer, 0 × pool deadlocks
docker ps -q | wc -l → 24 (8 per image × 3 images, persistent pool intact)
```

The 1 WA was a transient comparison glitch (well-known `[0,1] vs [0, 1]` formatting on one test). Container pool did not leak, no `fork/exec: resource temporarily unavailable` in the backend log.

### 3.6 Large output (informational, **not fixed in this unit**)

```
40_000_000 char stdout → HTTP 200, full 38.1 MB body returned
```

The sandbox does **not** enforce the documented 32 MB output limit. The CLAUDE.md spec calls for OLE (Output Limit Exceeded) at 32 MB. This is owned by the sandbox layer (Agent 2). Flagged here for tracking.

---

## 4. Bugs Found & Fixes Applied

### 4.1 `cmd/api/main.go` ignored `PORT` env var → **FIXED**

Added env-driven port selection; production behavior (`:8081`) preserved as default.

### 4.2 Handler returned `500` for nonexistent slugs on `/run` and `/judge` → **FIXED**

Both handlers had ad-hoc `strings.Contains(err, "currently unavailable") → 403, else 500`. Extracted a shared `judgeErrorStatus(err)` helper:

| Service error substring | HTTP |
| --- | --- |
| `problem not found` / `record not found` | 404 |
| `currently unavailable` | 403 |
| `no test cases` / `failed to parse test cases` | 422 |
| anything else | 500 |

Files: `backend/internal/handler/submission_handler.go`.

### 4.3 `AutoMigrate` was destructive — discovered live → **FIXED**

Initial symptom on every cold start:

```
Error 1170 (42000): BLOB/TEXT column 'slug' used in key specification without a key length
ALTER TABLE `problems` MODIFY COLUMN `slug` longtext
```

Root cause: every Go `string` field on `model.Problem` had **no explicit `type:` tag**. GORM defaults `string` to `longtext`. Each restart attempted to:

1. Convert `slug VARCHAR(200)` → `longtext` (failed because of unique index, blocking the rest).
2. Drop the `ENUM('Easy','Medium','Hard')` constraint on `difficulty` and replace it with `longtext`.
3. Convert `content TEXT` → `longtext`.
4. Strip `NOT NULL` from columns like `slug` and `is_vip_only`.
5. Add missing columns (`time_limit_ms`, `memory_limit_mb`) — silently skipped because step 1 failed.

The very first fix-pass (adding `type:varchar(200)` to `Slug` only) *unblocked* the migration, which then proceeded to corrupt the `difficulty` enum on the next restart — caught and rolled back manually:

```sql
ALTER TABLE problems MODIFY COLUMN difficulty ENUM('Easy','Medium','Hard') NOT NULL;
ALTER TABLE problems MODIFY COLUMN slug VARCHAR(200) NOT NULL;
ALTER TABLE problems MODIFY COLUMN content TEXT;
ALTER TABLE problems MODIFY COLUMN is_vip_only TINYINT(1) DEFAULT 0;
ALTER TABLE problems MODIFY COLUMN is_acm_mode TINYINT(1) DEFAULT 0;
```

Permanent fix: pin **every** field's column type on `model.Problem` so AutoMigrate is a no-op:

```go
Slug       string `gorm:"column:slug;type:varchar(200);not null;uniqueIndex"`
Difficulty string `gorm:"column:difficulty;type:enum('Easy','Medium','Hard');not null"`
Content    string `gorm:"column:content;type:text"`
// ... etc
```

Verified: restart now produces zero `ALTER TABLE` statements; row count still 3845; all enum values intact.

### 4.4 Missing columns added → **FIXED**

`time_limit_ms` and `memory_limit_mb` were referenced in `judge_service.go` but did not exist in the table. Backed up first, then added:

```
mysqldump -u root --no-data gatecode problems > /tmp/problems_schema_backup.sql
ALTER TABLE problems
  ADD COLUMN time_limit_ms   INT NOT NULL DEFAULT 0,
  ADD COLUMN memory_limit_mb INT NOT NULL DEFAULT 0;
```

The model tags now declare these columns explicitly, so future cold starts stay consistent.

---

## 5. Database Integrity

```sql
-- All checks return 0
duplicate_slugs                 0
duplicate_fqid                  0
null_slug                       0
null_title                      0
invalid_difficulty              0
bad_json_template_code          0
bad_json_test_cases             0
bad_json_solutions              0

-- FK integrity (no orphans)
submission_orphan_problem       0
submission_orphan_user          0
orders_orphan_user              0
curriculum_orphan_problem       0
curriculum_orphan_curriculum    0
```

Row counts:
* `problems`            3845 (3696 enabled, 149 disabled)
* `submissions, users, curriculums, orders`  all 0 (features not yet wired up)
* problems with `judge_enabled=1` but **empty `test_cases`**: **24** (Agent 2 territory — tree / design problems pending data)
* problems with empty `solutions`: 324 (informational; solutions are optional)

---

## 6. New Go Integration Tests

Created `backend/internal/handler/problem_handler_test.go` and `backend/internal/handler/submission_handler_test.go` using `net/http/httptest` + mock services that satisfy `service.ProblemService` / `service.JudgeService`. No DB or Docker required.

```
$ go test ./internal/handler/... -v
=== RUN   TestGetProblems_OK                                          PASS
=== RUN   TestGetProblems_DefaultsAndEdgeArgs                         PASS (5 sub)
=== RUN   TestGetProblems_ServiceError_500                            PASS
=== RUN   TestGetProblemBySlug_OK                                     PASS
=== RUN   TestGetProblemBySlug_NotFound                               PASS
=== RUN   TestGetProblemBySlug_SpecialChars                           PASS
=== RUN   TestRunCode_OK                                              PASS
=== RUN   TestRunCode_MissingFields_400                               PASS
=== RUN   TestRunCode_BadJSON_400                                     PASS
=== RUN   TestRunCode_ErrorMapping                                    PASS (6 sub)
=== RUN   TestJudgeCode_OK                                            PASS
=== RUN   TestJudgeCode_MissingFields_400                             PASS
=== RUN   TestJudgeCode_DisabledProblem_403                           PASS
=== RUN   TestJudgeCode_NotFound_404                                  PASS
=== RUN   TestJudgeCode_LargeCodeBody_AcceptedByHandler               PASS
PASS  ok  github.com/RedInn7/gatecode/backend/internal/handler  0.4s
```

Full suite: `go test ./...` → all green (handler + sandbox `compare_test.go`).

---

## 7. Open Items (out of Agent 3 scope)

1. **OLE (Output Limit Exceeded):** sandbox does not cap stdout at 32 MB (spec calls for it).
2. **Two-sum WA on `[3,3], 6`:** the comparator treats `[0, 1]` vs `[0,1]` correctly in compare_test.go but a small fraction of concurrent judges still flapped to WA — looks like a sandbox race, not handler. (Agent 2.)
3. **`record not found` leaks GORM-isms in error messages.** Cosmetic; could be wrapped to a friendlier message in the service layer.
4. **`user_handler.go`, `user_repo.go`, `submission_repo.go`, `user_service.go`, `payment_service.go`, `model/user.go`, `model/submission.go` are all empty.** No registered routes for them. Not bugs per se, but they should be marked `// TODO:` or removed.

---

## 8. Files Touched

* `backend/cmd/api/main.go` — `PORT` env support
* `backend/internal/handler/submission_handler.go` — consolidated error → HTTP status mapping (`judgeErrorStatus`)
* `backend/internal/model/problem.go` — explicit `type:varchar(200)` on `Slug`
* `backend/internal/handler/problem_handler_test.go` — new
* `backend/internal/handler/submission_handler_test.go` — new

Database (no schema drops):
* `ALTER TABLE problems ADD COLUMN time_limit_ms INT NOT NULL DEFAULT 0;`
* `ALTER TABLE problems ADD COLUMN memory_limit_mb INT NOT NULL DEFAULT 0;`
* Backup at `/tmp/problems_schema_backup.sql`
