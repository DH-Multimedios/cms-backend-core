# Root account hardening
Status: v2.0.1 prepared with PostgreSQL integration check pending before deployment. Delivery branch: main (original work units on feat/root-account-hardening).
Scope: preserve the unique root identity and its role-independent authority; reserve super_admin assignment for root. Existing admin/user roles remain assignable.

## Specs
S1. "esta es mi cuenta personal, yo necesito poder hacer todo independiente de los roles. miremoslo de esta forma mi cuenta es el root y cualquier otra es un user con poderes"
S2. "Yo lo que quiero es un usuario para mi solo, que no se pueda asignar y pueda hacer todo"
S3. "¿y que tenés que hacer? digo así empezamos a hacer algo"
S4. "pero son cambios útiles, así que los dejamos. documentá todo y commit y push"
S5. "actualizá versión y tag"

## Tasks
T1 [S1-S2] Ensure at most one root in the database, preserve the root bypass and validate bootstrap behavior. Route: bounded writer (context backstop); commit: 2e7f64a.
T2 [S1-S2] Reserve super_admin assignment for root without disrupting ordinary base-role assignment; preserve existing non-root behavior. Route: inline; commits: 3a1d731, 7ccf6d0.
T3 [S1-S3] Run regression checks and independent security verification, document the root boundary and close the feature. Route: independent verifier; commit: 580874c.
T4 [S4] Document all shipped contracts and verification limitations without choosing a release version. Route: inline; commit: d667965.
T5 [S5] Publish the existing root hardening change as immutable v2.0.1 on main with package version, release notes and install references aligned. Route: inline; commit: release tag v2.0.1 points to this work unit.

## Log
L1. ¿y que tenés que hacer? digo así empezamos a hacer algo
L2. Earlier clarification: "esta es mi cuenta personal, yo necesito poder hacer todo independiente de los roles. miremoslo de esta forma mi cuenta es el root y cualquier otra es un user con poderes"
L3. Earlier clarification: "Yo lo que quiero es un usuario para mi solo, que no se pueda asignar y pueda hacer todo"
L4. Initial evidence: `PermissionsGuard` explicitly bypasses permissions for isSystemUser; seedUsers checks count but no DB singleton constraint; users.create accepts roleIds without caller checks; users.update allows roles of equal weight. Preserve the existing root bypass and reject ordinary assignment of protected roles.
L5. T1 RED exit 1 (5 expected failures), GREEN exit 0 (11 tests); additive partial unique index and seed preserves existing root identity including soft-deleted roots. PostgreSQL integration unavailable: SQL assertions only; migration must reject pre-existing duplicate roots without cleanup.
L6. T2 RED exit 1 (protected-role create/update tests fail on previously accepted roles); GREEN exit 0 (16/16 UsersService tests). Current user is passed by the guarded users controller; non-root callers cannot assign protected roles. Ordinary equal-weight unprotected assignment and root protected assignment remain allowed.
L7. Independent verifier identified a regression: seeded roles user, admin and super_admin are all protected, so blocking all protected roles breaks ordinary default user creation. Reproduced RED exit 1 (1 failed, 16 passed); narrow reserved assignment to super_admin only; keep default user/admin roles assignable. Protected is a role-editing property, not an assignment restriction.
L8. Correction GREEN: 17/17 users service tests; final full suite: 11 suites, 83 tests exit 0; final TypeScript build exit 0; git diff --check passed. Independent verifier verified S1-S3 at application level and baseline ordinary create/update/remove differential, discovered and prompted correction L7. Actual PostgreSQL migration/enforcement not exercised: psql/postgres unavailable; deployment requires checking for duplicate root rows and migration in target environment. Assessment (RDD on) gave native risk medium, reviewDue false; no native review started at this point (see L10).
L9. Pre-existing hardening advisory outside this task: RolesService.update Object.assign(role, dto) depends on documented global whitelist/forbid validation to reject extra fields (such as isProtected). Existing production clients must retain this validation.
L10. Native review of target sha256:5c16622ea73a580afd5650e7c98a1b518d93bbef8b974b4f6a412c53e10d0a99 approved and acknowledged (lineage review-666ae5c70bc888ca); one non-blocking finding: PostgreSQL index not integration-tested.
L11. Owner scope correction, verbatim: "No entiendo que hiciste entonces, la idea era solamente asegurar el usuario isSystemUser eso no es un cambio mayor". No code was changed after this correction.
L12. Owner decision, verbatim: "pero son cambios útiles, así que los dejamos. documentá todo y commit y push". Preserve the role restriction and new service signature; document them transparently. Release version/tag remains undecided.
L13. T4 documentation structural checks: `git diff --check` exit 0; `node --test test/client-setup-docs.test.mjs test/esm-package.test.mjs` 4 passed, exit 0. Passive docs only: no meaningful RED; previously recorded 83 passing behavior tests and build are unchanged.
L14. Owner release instruction, verbatim: "actualizá versión y tag". Owner had explicitly rejected treating the unique-root requirement as a major bump. v2.0.1 chosen for this delivery; published notes explicitly warn that direct UsersService.create callers must pass currentUser. Existing v2.0.0 must remain unchanged.
L15. T5 RED: version/reference checks 2 failed, 2 passed, exit 1 against v2.0.0; GREEN: 4 passed, exit 0 with v2.0.1. TypeScript build exit 0; full Jest suite 11 suites, 83 tests exit 0; independent verifier found no release-content blocker. Native assessment reports reviewDue=false for the 7-path release metadata candidate; no new review started. Live PostgreSQL migration remains unverified.
