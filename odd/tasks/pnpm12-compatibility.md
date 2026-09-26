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

- [ ] **P12-1 — Pin and document pnpm 12.** Decide the minimum project-only tooling change after a frozen-install check; update the outdated setup requirement and any necessary root/test-app package metadata or lockfiles. Acceptance: version guidance matches verified toolchain; generated lock changes are reviewed; no dependency upgrades by accident. Route: delegated direct (manifest, docs, and lockfile interactions span multiple non-trivial files; read/preparation and write stay with one writer). Checks: frozen root and test-app installs, lockfile diff, package pin behavior.
- [ ] **P12-2 — Verify package and smoke app.** Run build, focused/full Jest tests, package readback, and `test-app` build/start smoke with no database mutations; document exact results and unresolved limits. Acceptance: report precisely what runs under pnpm 12 and any external-service dependencies; source and tracked `dist/` stay consistent. Route: delegated direct for install/build/tests; independent verifier only if required by native risk/mode. Checks: `pnpm build`, `pnpm test -- --runInBand`, test-app build/start bounded by timeout, package contents; `verify:fresh-install` skipped unless safe.

## Delivery and verification evidence

- Forecast: small authored manifest/docs change, potentially larger generated lockfile diff; 400 authored lines per task is advisory, not a cap. Delivery strategy: ask-on-risk. First review boundary: branch point `008302e`.
- No task completed yet. Record per-task commit, exact checks, RDD risk/consent outcome, running authored line count and next step before closure.
