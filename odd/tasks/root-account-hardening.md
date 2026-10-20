# Root account hardening
Status: active. Branch: feat/root-account-hardening.
Scope: preserve the unique root identity and its role-independent authority; prevent ordinary accounts from obtaining equivalent authority through role assignment.

## Specs
S1. "esta es mi cuenta personal, yo necesito poder hacer todo independiente de los roles. miremoslo de esta forma mi cuenta es el root y cualquier otra es un user con poderes"
S2. "Yo lo que quiero es un usuario para mi solo, que no se pueda asignar y pueda hacer todo"
S3. "¿y que tenés que hacer? digo así empezamos a hacer algo"

## Tasks
T1 [S1-S2] Ensure at most one root in the database, preserve the root bypass and validate bootstrap behavior. Route: bounded writer (context backstop); commit: first work-unit commit.
T2 [S1-S2] Prevent ordinary API clients from assigning protected roles or manufacturing equivalent protected privilege; preserve ordinary role behavior. Route: inline; commit: pending.
T3 [S1-S3] Run regression checks and independent security verification, document the root boundary and close the feature. Route: independent verifier; commit: pending.

## Log
L1. ¿y que tenés que hacer? digo así empezamos a hacer algo
L2. Earlier clarification: "esta es mi cuenta personal, yo necesito poder hacer todo independiente de los roles. miremoslo de esta forma mi cuenta es el root y cualquier otra es un user con poderes"
L3. Earlier clarification: "Yo lo que quiero es un usuario para mi solo, que no se pueda asignar y pueda hacer todo"
L4. Initial evidence: `PermissionsGuard` explicitly bypasses permissions for isSystemUser; seedUsers checks count but no DB singleton constraint; users.create accepts roleIds without caller checks; users.update allows roles of equal weight. Preserve the existing root bypass and reject ordinary assignment of protected roles.
L5. T1 RED exit 1 (5 expected failures), GREEN exit 0 (11 tests); additive partial unique index and seed preserves existing root identity including soft-deleted roots. PostgreSQL integration unavailable: SQL assertions only; migration must reject pre-existing duplicate roots without cleanup.
