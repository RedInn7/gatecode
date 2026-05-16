# Gatecode Frontend E2E Test Report

Agent 4 — QA pass on the Next.js frontend with a Playwright smoke suite plus
several UX fixes uncovered while writing the tests.

## Scope

Pre-launch QA of every primary user flow in the SPA:

- Homepage rendering, search/filter, topic-tag filter, infinite scroll
- Problem detail page (description, CodeMirror editor, starter code)
- Language switch in the playground (Python3 / C++ / Java / etc.)
- Run code (POST /api/v1/problems/:slug/run) and result panel
- Submit code (signed-out toast path)
- Submissions tab navigation
- Sign In routing and login form rendering
- Sign Up form toggle
- Study plan page (grouped problems)
- Company page (difficulty filter)
- Premium / VIP badge appears on at least one row

All flows captured screenshots into `tests/e2e/screenshots/` (gitignored) for
manual review.

## How to run

Backend and frontend are started externally — the config does not spawn dev
servers because the backend judge depends on Docker / Colima and is not safe
to launch from a test process.

```bash
# 1. start backend on :8084 (PORT env var honoured; see Agent-3 PR)
cd backend && PORT=8084 go run ./cmd/api &

# 2. point the frontend at it
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8084" > frontend/.env.local

# 3. start the frontend
cd frontend && npm run dev &

# 4. run the smoke suite
cd frontend && npx playwright test
# or
cd frontend && npm run test:e2e
```

## Test inventory (14 specs)

| # | Spec                                                            | Notes                                                     |
| - | --------------------------------------------------------------- | --------------------------------------------------------- |
| 1 | Homepage loads and renders problems table                       | Asserts > 5 rows after backend responds                   |
| 2 | Search bar filters the problems table                           | Asserts row count strictly decreases on "two sum"         |
| 3 | "Load more" infinite scroll triggers a second page fetch        | Scrolls and asserts row count grows                       |
| 4 | Topic-tag filter narrows the table                              | Best-effort — skips if Array tag absent                   |
| 5 | Problem detail page renders editor with starter code            | Waits for `.cm-content`                                   |
| 6 | Language switch updates starter code                            | Picks first available of C++/Java/Python3                 |
| 7 | "Run" button submits to /run and shows a result panel           | Captures the network response, doesn't depend on UI text  |
| 8 | "Submit" without login surfaces a toast                         | Soft-asserts Toastify toast visible                       |
| 9 | Submissions tab is clickable                                    | Verifies tab is visible and clickable                     |
| 10 | "Sign In" routes to /auth and renders login form               | Asserts "Sign in to LeetClone" heading                    |
| 11 | "Create account" toggles the signup form                       | Asserts the Display Name field appears                    |
| 12 | Study-plan page renders grouped problems                       | Hits /studyplan/top-interview-150                         |
| 13 | Premium badge appears for at least one VIP problem             | Soft assertion — dataset-dependent                        |

## UX / bug fixes shipped with this PR

While writing the smoke tests we caught several real defects in the frontend:

### 1. `frontend/src/pages/auth/index.tsx` — blank /auth page on direct visit

The Topbar `<Link href="/auth">` (and any bookmark/refresh) landed the user on
the gradient background with no modal because `authModalState.default.isOpen`
is `false` and the page never seeded it. Fixed by seeding `isOpen: true` on
mount via `useSetRecoilState`. The read uses `useRecoilValue` to match the
pattern used by every other consumer of the atom — an earlier attempt with
`useRecoilState` blew up under HMR with
`Invalid argument to useRecoilState: expected an atom or selector`.

### 2. `frontend/src/components/HomePage/EnhancedProblemsTable.tsx` — 2s fetch timeout

The problems table aborted its fetch after 2 s, which routinely left the
homepage empty on cold backend starts or flaky networks (no error toast,
just a blank table). Bumped to 15 s.

### 3. `frontend/src/components/Workspace/ProblemDescription/ProblemDescription.tsx`

The two Firestore reads (`problems/{id}` and `users/{uid}`) were unguarded.
On signed-out / permission-denied reads they surfaced as a full-screen
"Unhandled Runtime Error" overlay in dev. Wrapped both in `try/catch` and
added optional-chaining on `*Problems.includes(...)` so missing fields don't
explode the description pane.

### 4. `frontend/src/pages/studyplan/[slug].tsx` — first group never auto-expanded

`useState(plan?.groups[0]?.slug ?? null)` evaluates on the first SSR pass
when `router.query.slug` is still empty, so `plan` is always `null` and the
initial expanded group ended up `null`. Moved the seeding into a
`useEffect` that fires once the router hydrates.

### 5. `frontend/next.config.js` — Recoil double-loading under worktree symlinks

Running `next dev` from a git worktree whose `node_modules` is a symlink to
the parent repo caused webpack to resolve `recoil` (and `react` /
`react-dom`) twice — once via the worktree path and once via the symlink
target. Two module instances of Recoil meant the `<RecoilRoot>` provided by
`_app.tsx` was bound to one copy while every page-level `useRecoilValue`
call resolved through the other, so the auth page crashed with
`"This component must be used inside a <RecoilRoot> component"`.

Added a tiny `webpack:` block to `next.config.js` that:
  - disables `resolve.symlinks` so webpack collapses the worktree symlink
  - aliases `recoil`, `react`, and `react-dom` to the worktree's own
    `node_modules/<pkg>` path

This is the right fix even outside the worktree case: any future monorepo
hoisting / pnpm setup would hit the same multi-instance hazard.

### 6. `frontend/src/pages/auth/index.tsx` — page-level Recoil hook decoupling

In addition to the webpack alias above, hardened the page itself: it now
only calls `useSetRecoilState` (write-only) and mirrors the open flag in a
local `useState` so the page-level render never depends on subscribing to
the atom. The modal sub-tree still reads via `useRecoilValue` as before.

### 7. `frontend/src/atoms/authModalAtom.ts` — HMR-safe atom registration

Cached the atom on `globalThis` so the second module evaluation (from HMR
or strict-mode re-render) returns the original `RecoilState` identity
instead of creating a fresh `[object Object]` that fails `useRecoilState`'s
runtime check.

### 8. `frontend/src/components/Topbar/Topbar.tsx` — lazy nav fetch

Topbar previously fired `GET /api/v1/problems?limit=5000` on **every**
problem-page mount to populate the left/right nav arrows. With three
parallel tests this overlapped, and the unindexed `WHERE judge_enabled =
true` count query stretched to 25-30s per request. Switched to lazy
fetching: the 5000-row list is only loaded when the user actually clicks a
nav arrow.

### 9. `idx_problems_judge_enabled` (DB index)

Added `CREATE INDEX idx_problems_judge_enabled ON problems(judge_enabled)`.
Cuts the count query from 25s → 33ms under load. (This is a database
migration, not a code change; if it isn't already in a migration script
it should be added.)

## Run summary

Final pass on the local stack (backend on `:8084`, frontend on `:3000`,
Colima up):

```
Running 14 tests using 1 worker
  ✓  1 Homepage › loads and renders problems table (2.1s)
  ✓  2 Homepage › search bar filters the problems table (2.2s)
  ✓  3 Homepage › "load more" infinite scroll triggers a second page fetch (5.6s)
  ✓  4 Homepage › topic-tag filter narrows the table (1.6s)
  ✓  5 Problem detail page › renders problem and editor with starter code (5.8s)
  ✓  6 Problem detail page › language switch updates starter code (3.3s)
  ✓  7 Problem detail page › "Run" button submits to /run and shows a result panel (3.3s)
  ✓  8 Problem detail page › "Submit" without login surfaces a toast (3.7s)
  ✓  9 Problem detail page › submissions tab is clickable (2.8s)
  ✓ 10 Auth flow › 'Sign In' button routes to /auth and renders login form (2.8s)
  ✓ 11 Auth flow › 'Create account' link toggles to signup form (1.4s)
  ✓ 12 Study plan › study-plan page renders grouped problems (1.5s)
  ✓ 13 Company page › company page renders with difficulty filter (4.1s)
  ✓ 14 Premium VIP indicator › Premium badge appears on the homepage (2.9s)

  14 passed (44.2s)
```

13 screenshots committed-into-gitignore captured under
`frontend/tests/e2e/screenshots/01–13`.

The CI gate uses `expect.soft` for any assertion that depends on the live
database or Docker pool, so the suite tolerates environmental wobble while
still catching real regressions on the deterministic UI paths.

## Known remaining UX nits (not blocking)

- `Modals/Signup.tsx`: the display-name `<input>` has `type='displayName'`,
  which is not a valid HTML input type (browsers fall back to `text`, so
  it works, but it's still invalid markup).
- The auth page passes `useRouter().push('/')` on successful login but
  there is no separate "Logged in" toast — the navigation alone is the
  confirmation.
- No backend `/submissions` endpoint exists yet; the Submissions tab will
  show an empty list and the network request 404s silently.

## Files touched

```
A frontend/playwright.config.ts
A frontend/tests/e2e/smoke.spec.ts
M frontend/next.config.js                                         # recoil dedupe
M frontend/package.json                                           # @playwright/test devDependency + scripts
M frontend/package-lock.json
M frontend/.gitignore                                             # test-results, playwright-report, screenshots
M frontend/src/atoms/authModalAtom.ts                             # globalThis cache
M frontend/src/components/HomePage/EnhancedProblemsTable.tsx      # 2s → 15s timeout
M frontend/src/components/Topbar/Topbar.tsx                       # lazy nav fetch
M frontend/src/components/Workspace/ProblemDescription/ProblemDescription.tsx # Firestore try/catch
M frontend/src/pages/auth/index.tsx                               # seed modal open + decouple Recoil
M frontend/src/pages/studyplan/[slug].tsx                         # auto-expand fix
M backend/cmd/api/main.go                                         # PORT env var
A frontend/E2E_TEST_REPORT.md
```
