# Nest 12 core upgrade

## Objective

Move `@dh/backend-core` and its minimal startup fixture to NestJS 12 only. Current clients run the core in production and will update; preserve functional API/session/database contracts, but do not implement dual Nest 11/12 support, dual builds, or unrelated refactors. Work on `feat/nest12-core`, branched from the verified pnpm 12 baseline `39575ce`. No push, release, client-repository edits, or PR authorized.

## Constraints and evidence

- Published Nest 12 core/common/platform-express are ESM; the official migration guide allows existing CommonJS applications on Node 20.19+/22.12+ via `require(esm)`. Do not convert the library to ESM unless a real packaged-consumer check requires it.
- Published `nestjs-cls@7` supports Nest 12 but requires Node >=22; `nestjs-cls@6` excludes Nest 12. Keep the runtime engine honest, document the new minimum, and test on available Node 24.21.0 without claiming coverage for untested runtimes.
- Swagger 12 and Serve Static 12 have Nest 12-only peers. Align all Nest runtime/dev dependencies and the test-app's independent lockfile; do not change TypeORM 1.1 schema or seeds just to upgrade Nest.
- Root and test-app use pnpm 12.6.0 and independent locks. The root `dist/` is tracked and consumed from Git; build with `pnpm build`, NOT the root Nest CLI, which can erase tracked outputs. Test-app imports the packaged core, not root source.
- The Nest 11 baseline ran 56 Jest tests and returned HTTP 200 from `GET /api/health` against a local disposable PostgreSQL container. Any new smoke DB must be unique, localhost-bound, and removed; no existing DB, ambient `.env`, image download, seed, or credential reuse.
- Anonymous HTTPS npm downloads are authorized only from registry.npmjs.org; no SSH or GitHub remote operations. RDD is globally off. No project/session TDD mode was found; use ordinary functional checks with `pnpm exec jest --runInBand`, and report any test-first evidence only if observed.

## Tasks

- [x] **N12-1 — Upgrade the core's Nest contract.** Nest 12-only root peers and dependencies, CLS 7, Node >=22.12.0 runtime floor, client guide, independent root lockfile, and minimal Jest ESM support were updated together. CommonJS output and tracked `dist/` stayed unchanged. Route: delegated direct (multiple manifests, lockfile, docs, and tests); no production code refactor. `SHARP_IGNORE_GLOBAL_LIBVIPS=1 pnpm install --frozen-lockfile --strict-peer-dependencies` passed anonymously against registry.npmjs.org without peer warnings; `pnpm build` and independent no-emit typecheck passed; `pnpm test --runInBand` and an independent offline uncached run passed all 8 suites/56 tests; `git diff --check`, packaged main/types and `require('./dist')` passed on Node 24.21.0. Tests use scoped Jest ESM VM mode and preserve TypeScript decorator metadata; the VM flag remains experimental. No Node 22 runtime, real client, or database smoke was claimed. Native risk assessment was high/unassessable due unrelated untracked inventory; independent verifier passed functional checks. Rollback boundary: root Nest 12 manifest/lock, client guidance, Jest configuration, seven specs, and UUID mock; no migration/schema change. Commit identity: pending.
- [ ] **N12-2 — Align and smoke the single Nest 12 test-app.** Upgrade its Nest dependencies and lockfile, ensure it imports packaged core, compile and start against unique disposable local PostgreSQL with core migrations and `synchronize:false`, and verify HTTP health. Route: delegated direct (manifest/lock/install and runtime verification). Acceptance: app loads the Nest 12 core without duplicate Nest instances, HTTP 200, all temporary DB/app resources cleaned, no tracked `dist` drift; document the tested runtime and limits. Checks: frozen test-app install, non-incremental test-app build, root Jest, packaged import and bounded localhost smoke.

## Delivery and progress

Two work units, with generated lockfiles excluded from the authored-line planning heuristic; roughly 400 authored changed lines per task is advisory, never a reason to omit docs/tests. Delivery strategy: ask-on-risk. First review boundary for this feature: `39575ce`. N12-1 verification is complete, with only intended new task/mock paths to stage; the pre-existing `.codegraph/` index stays outside the candidate. Next: N12-2 upgrade of test-app and isolated PostgreSQL smoke. Do not infer production client readiness from unit tests alone.
