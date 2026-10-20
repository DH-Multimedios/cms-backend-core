# ESM-only backend core 2.0
Branch: `feat/backend-core-esm-only`. No dual CJS/ESM build. Client-repository access and release/tag/push remain separate authorizations.

## Specs

S1. User: “No me gustan las cosas hibridas, traen problemas incontrolados. ¿podemos crear una rama nueva convertir todo a ESM y probar en el cliente?”
S2. User selected: “ESM en v2.0.0”.
S3. User: “No quiero que toques el cliente, cuando sea necesario me decís que hacer y lo hago. Para probar en el cliente hay que tener la rama en Github”.
S4. User selected: “Replantear cómo se distribuye el paquete”.

## Tasks

- [>] T0 [S1-S4] Inline: establish a Git-installable ESM source-build distribution without tracking generated dist, verify lifecycle from repo-local fixture before removing tracked artifacts; commit pending.
- [ ] T1 [S1-S2] Inline: convert package/build/source imports and entity runtime evaluation to native ESM; focused compile and runtime checks; commit pending.
- [ ] T2 [S1-S2] Inline: migrate TypeORM CLI, seeds, verification scripts and Jest harness to ESM, verify migration workflows safely; commit pending.
- [ ] T3 [S1-S3] Inline: convert bundled client setup guidance and repo-local test-app (not actual client) to ESM, run package consumer smoke and suite; commit pending.
- [ ] T4 [S1-S3] Inline: independent high-risk verification, final diff/release boundary and instructions for owner-run client proof; branch push only after explicit authorization; commit pending.

## Log

L1. User: “No me gustan las cosas hibridas, traen problemas incontrolados. ¿podemos crear una rama nueva convertir todo a ESM y probar en el cliente?”
L2. User selected “ESM en v2.0.0” rather than converting the first `v1.0.0` release. New branch created from clean `main`; no tag, merge, push or release authorized. The actual external client repository is not identified or authorized, so only repository-local `test-app` can be touched until its path and permission are provided.
L3. Prior read-only exploration: root package currently compiles CommonJS; 118 source files contain relative extensionless imports, TypeORM relation cycles may need `Relation<T>`, scripts/CLI/seeds use CommonJS, `00-setup.md` documents a CommonJS DataSource, and repo-local `test-app` has a stale `file:..` package snapshot. Node 24 could import the root CJS `dist` from ESM, but that alone does not establish ESM-only package viability.
L4. User correction verbatim: “No quiero que toques el cliente, cuando sea necesario me decís que hacer y lo hago. Para probar en el cliente hay que tener la rama en Github”. The owner will perform testing in the actual client; do not access it or claim it tested. Repo-local `test-app` is within core scope. GitHub branch push is a publishing action and requires an explicit authorization before execution.
L5. T1 observed RED from `node --test test/esm-package.test.mjs` (exit 1: manifest version 1.0.0 instead of 2.0.0), then mechanically changed 612 relative import/export specifiers across 118 `src` files to `.js`/`index.js` with AST-based edits; `git diff --check` passed. Added package `type: module`, version 2.0.0 and single ESM export, TS `NodeNext` resolution; `tsc --noEmit`, ESM build and package-entry Node test passed GREEN (1/1). No client touched.
L6. Build surfaced a consequential review/distribution scope: `dist` contains 776 tracked files; 517 changed from the format conversion, producing 8,081 diff lines in addition to 1,224 source diff lines. Since clients install directly from Git and the package includes `dist`, the generated output cannot simply be omitted without changing the delivery contract. Pause before a large compiled-output commit and request an owner decision on review workload versus changing distribution.
L7. User selected “Replantear cómo se distribuye el paquete”: avoid committing generated ESM `dist` and establish a verifiable build/install workflow first. Source changes remain uncommitted and the compiled tracked dist is modified locally. No distribution mechanism has been selected or proven yet; do not untrack `dist` or promise Git install until a repo-local fixture demonstrates it.
