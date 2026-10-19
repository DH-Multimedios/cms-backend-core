# Backend client package handoff accuracy
Branch: `docs/backend-client-handoff-accuracy`. Docs and bundled skill only; no client repository, service behavior, database, or deployment changes.

## Specs

S1. User: “revisemos @docs/backend-client/00-setup.md y el resto de archivos en ese folder, la idea es pasarle un archivo al euivo de backend para que pueda configurar bien todo ¿que le paso?”
S2. User: “tené en cuenta que que cuando importe el paquete la doc va incluida y un skill de como usarlo”.
S3. User: “corrijamos eso antes de instalarlo en el nuevo cliente y quiero que veamos algo luego de eso”.

## Tasks

- [x] T1 [S1-S3] Inline: make setup and overrides state actual migrations, permissions, and startup path; commit `7f2c4177c5c6e32ceb7d830ad4a378fc196ed240`.
- [x] T2 [S1-S3] Inline: align Files and Media examples with ownership, pagination, authorization, paths and supported extensions; commit `f50a525bfb16ec191ca4768ecfef3571c05270fa`.
- [x] T3 [S1-S3] Inline: correct notification, settings and packaged skill contracts; commit `6e14b18914f7c266dc497a6765769123362d8f27`.
- [x] T4 [S1-S3] Inline: structural checks of examples and package contents, ordinary tests/build if applicable; commit evidence in final closure.

## Log

L1. User: “corrijamos eso antes de instalarlo en el nuevo cliente y quiero que veamos algo luego de eso”.
L2. The earlier review identified unsafe `overrides.md` migrations, Files/Media omitted identity and hard-coded elevated permission flags, wrong pagination/owner defaults, unavailable notification barrel export and incomplete listener, private Media subclass hooks, stale `app.logoUrl` assertion, and an inconsistent packaged skill. Resolve these against public source contracts; never claim client integration was tested.
L3. Owner authorized one read of the external cognitive-doc-design skill; instructions emphasize answer-first, progressive disclosure, chunking and checkable steps. No push, merge, client install, or PR was authorized in this request. The unspecified later topic is separate.
L4. T1: `00-setup.md` leads with packaged docs/skill and new-DB boundary; `overrides.md` no longer claims core migrations auto-run or shows a noncompiling async guard override; `01-permissions.md` distinguishes registration from role assignment and warns that rerunning core seeds replaces base-role assignments. `git diff --check` passed; docs-only changes have no meaningful runnable RED. Commit `7f2c4177c5c6e32ceb7d830ad4a378fc196ed240`.
L5. T2: `files.md` now reflects owner-null default, paginated results, and omitted-identity list behavior; `media.md` distinguishes static public URLs from protected metadata, removes hardcoded elevated flags and private subclass recipes, and states URL/path and S3 limits. Structural grep of previously incorrect claims and `git diff --check` passed; no source behavior changed. Commit `f50a525bfb16ec191ca4768ecfef3571c05270fa`.
L6. T3: `notifications.md` now uses exported `NotificationsService.notifySystem()` with a client-owned listener and authenticated admin type/template endpoints, explicitly notes preference bypass, compiled templates and the active provider; settings and skill use `app.logo`, no private Media hooks or unsafe global guard override. Structural grep and `git diff --check` passed; functional build/pack checks remain T4. Commit `6e14b18914f7c266dc497a6765769123362d8f27`.
L7. Review slice boundary: T1, T2, and T3 were committed independently as 85, 171, and 326 authored changed-line slices (each under ~400); cumulative feature diff is 582 lines largely from deleting unsafe documentation. T4 is verification/tracking closure, not a new behavior slice. Do not publish/merge before explicit approval.
L8. T4 evidence: `pnpm run build` passed; `npm pack --dry-run --json --ignore-scripts` listed all seven changed backend-client guides, the packaged skill, dist index, and baseline migration (807 entries). `pnpm test -- --runInBand` exited 1 without running tests because the extra `--` made Jest treat `--runInBand` as a pattern; corrected `pnpm test --runInBand` passed (10 suites, 67 tests). Structural source comparisons, GitHub-style relative Markdown link/anchor check (8 files, 0 errors), and `git diff --check` passed. No client install, database, browser, merge, or push was performed.
