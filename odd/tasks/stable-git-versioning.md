# Stable Git-tag versioning
Branch: `docs/backend-client-handoff-accuracy`. Prepare stable package version and client-facing guidance; do not create or push a tag, merge, publish, or install in a client.

## Specs

S1. User: “veamos el tema de como el cliente instala versiones ahora lo ata a un commit ¿no es mejor que sea a la versión? Hablemos. cambiamos a la versión 1.0.0 y de ahí vamos subiendo versiones con los cambios”
S2. User: “si hagamos esto y ajustemos @docs/backend-client/00-setup.md para reflejarlo. A partir de ahora el paquete es estable”

## Tasks

- [x] T1 [S1-S2] Inline: align package version, changelog, README and fresh-client setup with private immutable version tags and deliberate SemVer upgrades; commits `28b6e8d868752ca6fd495f4e6558d74e6350ac83`, `675db155294dbc8d9dac3802e5c2e980b7c993ff`.
- [x] T2 [S1-S2] Inline: check version references, package inventory, build and applicable tests; document release boundary and close; commit pending evidence entry.

## Log

L1. User: “si hagamos esto y ajustemos @docs/backend-client/00-setup.md para reflejarlo. A partir de ahora el paquete es estable”.
L2. Decision context: the preceding proposal was to use Git tags in the private repository instead of publishing to a registry, with `v1.0.0` for the first stable package. The current package version is `0.1.0`, changelog has `Unreleased` breaking changes, and no local tags exist. The existing client guide already accepts either tag or SHA; its default should become an immutable version tag, with lockfile preserving the resolved commit. The README currently gives an unpinned Git URL. `test-app/package.json` is an independent project; its `0.1.0` is not this package version.
L3. Publishing and repository operations remain separate: existing docs handoff commits are not yet merged into `main`; creating an actual `v1.0.0` tag before the final delivery commit would point to the wrong tree. A local tag or push is not part of this preparation. No registry publication or client installation was authorized.
L4. T1: package manifest declares 1.0.0; README and `00-setup.md` install from `#v1.0.0` only after the tag is published and explicitly distinguish package version from Git tag/lockfile commit; existing-DB upgrade no longer gives an unsafe unqualified migration/seed shell sequence. Changelog stages first stable release as pending tag publication (no false date), corrects runtime requirements and records storage breaking change. `test-app` version stays independent. `git diff --check` passed. This is a release/environment change (Risk: item 5), not a code-logic change: no meaningful runnable RED; T2 will perform structural and package checks with an independent verifier. Implementation commit `28b6e8d868752ca6fd495f4e6558d74e6350ac83`.
L5. Independent `gentle-ai-verify` read the whole feature document and commit 28b6e8d, found S1/S2 met for preparation only, and flagged a historical `CHANGELOG.md` roadmap still titled “Pendiente para 1.0.0” with an npm registry checkbox. Corrected that heading to mark ideas not included in 1.0.0 and clarified there is no registry in this plan. Focused structural assertions and `git diff --check` now pass; tag/remote/install status remains unproven and deliberately deferred. Correction commit `675db155294dbc8d9dac3802e5c2e980b7c993ff`.
L6. T2: `pnpm run build` passed; `npm pack --dry-run --json --ignore-scripts` reports `@dh/backend-core@1.0.0` with 807 files including `README.md`, `CHANGELOG.md`, `docs/backend-client/00-setup.md`, bundled skill, dist entry and baseline migration; `pnpm test --runInBand` passed (10 suites, 67 tests). Focused release-guidance relative links passed with 0 errors and `git diff main --check` passed. A broader README link probe reported two *pre-existing*, untouched broken links (`docs/PLAN.md`, `docs/DECISIONES.md`); not part of this versioning change. No published Git tag or client installation was tested, as publication is deferred. An independent verifier found S1/S2 satisfied for preparation, not publication, and its one in-scope advisory was corrected. Release/environment Risk: item 5; 1.0.0 delivery remains an owner decision, not a completed publish.
