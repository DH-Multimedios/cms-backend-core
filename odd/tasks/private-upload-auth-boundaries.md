# Private upload and Files authorization boundaries
Branch: `feat/private-upload-auth-boundaries`. Scope: findings 1 and 2 from the preceding documentation/skill review; existing Node-range edits remain separate.

## Specs

S1. User request: “arregla 1 y 2”. Finding 1 quoted from the preceding review: “Crítico — configuración de uploads privados.”
S2. User request: “arregla 1 y 2”. Finding 2 quoted from the preceding review: “Alto — permisos atribuidos al servicio.”
S3. User selected: “Bloquear configuración compartida y exigir migración (recomendado)”. Its offered consequence: “Separar directorios privados/públicos; si detectamos un path compartido, fallar al iniciar. Documentar migración manual de archivos existentes, sin moverlos automáticamente.”

## Tasks

- [x] T1 [S1,S3] Inline: RED/GREEN isolate private Files from public Media, reject legacy/shared paths, document manual migration. Commit: pending evidence entry.
- [x] T2 [S2] Inline: RED/GREEN enforce Files edit/delete permission at service boundary without breaking existing userId call shape; update docs/skill. Commit: pending evidence entry.
- [ ] T3 [S1-S3] Inline: focused checks, suite, typecheck, differential shared-command check and review risk. Git identity is configured; commit and RDD candidate review pending.

## Log

L1. User: “arregla 1 y 2”.
L2. User selected: “Bloquear configuración compartida y exigir migración (recomendado)”.
L3. Before implementation: `README.md`, `docs/backend-client/00-setup.md`, and `package.json` have pre-existing Node engine edits; do not include them in this feature's commits except specifically staged related README hunks. `.codegraph/` is unrelated and must remain untouched.
L4. RED: `pnpm test --runInBand --no-cache --runTestsByPath src/core/core.module.spec.ts src/modules/files/files.service.spec.ts` exited 1: shared storage cases did not throw; initial Files spec compiled against a prospective fourth constructor dependency only after changing the test to construct dynamically. Focused Files RED exited 1 with two unauthorized mutations resolving rather than rejecting (two existing behaviors passed).
L5. GREEN: focused Jest passed 2 suites/9 tests. Storage: reject UPLOADS_PATH and private roots under public roots; separate FILES_UPLOAD_PATH/MEDIA_UPLOAD_PATH with defaults. Files: load active user/roles/permissions before update/remove and preserve userId call shape. Documentation and skill explain fail-closed/manual migration and authenticated identity.
L6. Independent verifier found a synchronous ConfigModule timing gap (S1 unmet); reproduced RED against CoreModule.register, then moved ConfigModule.forRoot before root selection and observed focused GREEN, 2 suites/11 tests. Also reproduced RED/GREEN for absolute MEDIA_UPLOAD_PATH, changing static root to resolve(...). Independent verifier's scratch build attempted an unrequested dependency download; discard its build evidence. The parent ran local Jest 10 suites/67 tests, root build, fixture typecheck and git diff --check: all exit 0.
L7. After formatting, Prettier check, Jest 10 suites/67 tests, root build, independent fixture no-emit typecheck and git diff --check all exited 0. No database or legacy file movement. Differential CLI check not applicable: no command or option was changed; public module/storage behavior is pinned with RED/GREEN tests. RDD switch is on; candidate review after work-unit commit is pending.
L8. Initial `git commit` exited 128 because Git author identity was unavailable. Owner configured repository author name/email before continuation; the feature's exact files remain staged and prior Node engine edits in README.md, docs/backend-client/00-setup.md and package.json remain unstaged. No commit or native review candidate existed at this checkpoint.
