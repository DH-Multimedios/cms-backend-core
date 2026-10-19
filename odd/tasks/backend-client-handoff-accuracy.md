# Backend client package handoff accuracy
Branch: `docs/backend-client-handoff-accuracy`. Docs and bundled skill only; no client repository, service behavior, database, or deployment changes.

## Specs

S1. User: “revisemos @docs/backend-client/00-setup.md y el resto de archivos en ese folder, la idea es pasarle un archivo al euivo de backend para que pueda configurar bien todo ¿que le paso?”
S2. User: “tené en cuenta que que cuando importe el paquete la doc va incluida y un skill de como usarlo”.
S3. User: “corrijamos eso antes de instalarlo en el nuevo cliente y quiero que veamos algo luego de eso”.

## Tasks

- [x] T1 [S1-S3] Inline: make setup and overrides state actual migrations, permissions, and startup path; commit pending evidence entry.
- [>] T2 [S1-S3] Inline: align Files and Media examples with ownership, pagination, authorization, paths and supported extensions; commit pending.
- [ ] T3 [S1-S3] Inline: correct notification, settings and packaged skill contracts; commit pending.
- [ ] T4 [S1-S3] Inline: structural checks of examples and package contents, ordinary tests/build if applicable; commit pending.

## Log

L1. User: “corrijamos eso antes de instalarlo en el nuevo cliente y quiero que veamos algo luego de eso”.
L2. The earlier review identified unsafe `overrides.md` migrations, Files/Media omitted identity and hard-coded elevated permission flags, wrong pagination/owner defaults, unavailable notification barrel export and incomplete listener, private Media subclass hooks, stale `app.logoUrl` assertion, and an inconsistent packaged skill. Resolve these against public source contracts; never claim client integration was tested.
L3. Owner authorized one read of the external cognitive-doc-design skill; instructions emphasize answer-first, progressive disclosure, chunking and checkable steps. No push, merge, client install, or PR was authorized in this request. The unspecified later topic is separate.
L4. T1: `00-setup.md` leads with packaged docs/skill and new-DB boundary; `overrides.md` no longer claims core migrations auto-run or shows a noncompiling async guard override; `01-permissions.md` distinguishes registration from role assignment and warns that rerunning core seeds replaces base-role assignments. `git diff --check` passed; docs-only changes have no meaningful runnable RED.
