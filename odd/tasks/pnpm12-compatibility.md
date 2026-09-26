# pnpm 12 compatibility

## Objective and scope

After the OS reinstall, make the existing pnpm-managed backend-core repository reproducible with pnpm 12.6.0 and verify that its intentionally minimal `test-app` can build and start. Keep the root and `test-app` as separate projects with separate lockfiles; do not change runtime or consumer package-manager policy without evidence. Work locally on `chore/pnpm12-compatibility`; no push or PR is authorized. Dependency downloads are authorized only over HTTPS from registry.npmjs.org without credentials.

## Current evidence and constraints

- The root and `test-app` already use pnpm lockfiles v9; do not run `pnpm import`.
- The root workspace contains only the root package; `test-app` uses `file:..` and is a startup smoke fixture.
- Node 24.21.0 and pnpm 12.6.0 are installed; current Node engines admit Node 24.21.0.
- `dist/` is tracked and required by Git consumers; preserve it and verify packaged output.
- A pnpm 12 offline frozen lockfile-only check failed with `ERR_PNPM_NO_OFFLINE_META` for a sharp optional-platform metadata entry; this is inconclusive, not an incompatibility.
- `verify:fresh-install` deletes a PostgreSQL database ending in `_test`; do not run it without a disposable database and explicit confirmation.
- No project/session TDD mode was found; this is tooling/docs-only work, with functional verification via pnpm/Jest/build. Test runner: `pnpm test`. Do not claim observed RED/GREEN.
- Avoid credential files and SSH/GitHub access; do not install from any unapproved destination. Preserve pre-existing untracked `.codegraph/` separately from this candidate.

## Plan and progress

- [x] **P12-1 — Pin and document pnpm 12.** Pinned 12.6.0 in both independent manifests, recorded its standard two-document lockfiles, added a narrow `test-app` script allow-list, and corrected the client guide without forcing downstream pnpm 12. Route: delegated direct (manifest, docs, and lockfile interactions span multiple non-trivial files; read/preparation and write stayed with one writer). Both frozen installs passed with `SHARP_IGNORE_GLOBAL_LIBVIPS=1`; plain fresh test-app install failed on this host because Sharp detects system libvips and requires `node-gyp`. The conditional local workaround is in README; it is not a client requirement. Root build and 8 Jest suites/56 tests passed; independent no-emit root/test-app typechecks and Jest spot check also passed. Lockfile dependency graph unchanged; `git diff --check` passed. Commit: `0442035ee596e38ec3de9524febe7d9a46150852` (`chore: pin pnpm 12 for core development`). RDD: global off; no native review started. Native candidate assessment: high/unassessable because unrelated untracked inventory; independent verifier passed. Rollback boundary: this commit's pnpm metadata, lockfiles, allow-list, and associated documentation; no runtime behavior changed.
- [ ] **P12-2 — Verify package and smoke app.** Corrected the fixture to import the packaged `@dh/backend-core` and compile only test-app `src/`; the original source import mixed Nest 11.1.18 and 11.1.28 and failed `ClsRootModule`/`HttpAdapterHost` injection. `start:prod` remains `node dist/main`, matching the corrected build. Route: delegated direct (multiple non-trivial files and write preparation). Root build, root Jest (8 suites/56 tests), test-app build/typecheck, package tarball main/types readback, and independent Nest dependency identity/typecheck/Jest verification passed; tracked core `dist/` unchanged. A bounded isolated startup with dummy localhost port 1 initialized Nest modules past the former DI failure, then timed out after TypeORM `ECONNREFUSED 127.0.0.1:1`. No HTTP listener was verified, so this task remains open pending a safely disposable local PostgreSQL test database and bounded startup. Do not use ambient `.env` or run `verify:fresh-install` against an existing DB. Rollback boundary: test-app import and TypeScript project scope only; no core runtime change. RDD global off; native assessment unassessable/high due unrelated untracked inventory, independent verifier passed. Checks omitted: real HTTP startup, fresh-install database verifier. Partial work-unit commit: `5bb9b467c1a2d63fcd352504081e57447970d445` (`fix(test-app): load packaged core for startup smoke`).

## Delivery and verification evidence

- Forecast: small authored manifest/docs change, potentially larger generated lockfile diff; 400 authored lines per task is advisory, not a cap. Delivery strategy: ask-on-risk. First review boundary: branch point `008302e`.
- P12-1 committed 0442035; authored diff: 360 additions/deletions including 316 generated pnpm lockfile lines and the 26-line task document. P12-2 partial fix committed 5bb9b46 (12 authored additions/deletions, including task progress); running total 372. No PR decision is required solely from generated lockfile growth. Next: request a disposable local PostgreSQL target before claiming startup.
