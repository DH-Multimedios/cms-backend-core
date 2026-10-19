---
name: backend-core
description: "Trigger: @dh/backend-core, CoreModule, backend core, cms-backend-core. Contracts and extension points for any NestJS project consuming @dh/backend-core."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Load this skill when the agent is working in a NestJS project that imports `@dh/backend-core`. It ships inside the package but is not auto-activated by installation; consult the matching installed version at `node_modules/@dh/backend-core/skills/backend-core/SKILL.md` alongside `docs/backend-client/00-setup.md`.
Applies to: module wiring, guards, permissions, seeds, migrations, files, media, notifications, settings, taxonomies, user preferences, and any extension of core services.

---

## Hard Rules

### Bootstrap (never skip)
- Register via `CoreModule.registerAsync(...)` only. Never instantiate modules manually.
- `ConfigModule.forRoot({ isGlobal: true })` MUST be imported before `CoreModule`.
- `synchronize: false` is mandatory in all environments.
- `runCoreSeeds(AppDataSource)` MUST run BEFORE any client seed. Order is non-negotiable.
- `data-source.ts` MUST spread `...CORE_ENTITIES` first, then add client entities.
- Resolve the packaged core migration glob as shown in `docs/backend-client/00-setup.md`, alongside client TS/JS migrations. Installing the package never runs migrations. The baseline is for a fresh database: do not run it against an existing schema without a transition plan.
- Rerunning core seeds replaces base-role assignments with the core permission list. Preserve/reassign client permissions when reseeding; `registerPermissions` creates records, it does not assign roles.

### Auth / Session
- `credentials: true` in CORS is REQUIRED — without it, HttpOnly cookies are never sent.
- The core applies `cookie-parser` globally; do NOT add it again in `main.ts`.
- Session duration is driven by the `auth.sessionExpiration` Setting (days). `AuthConfig.sessionExpiration` is a fallback only, not a runtime override.
- `isSystemUser: true` bypasses `PermissionsGuard`, but service-specific ownership filters can still apply (notably Media). Do not equate a service caller's user ID or boolean flag with authentication.

### Permissions
- Convention: `{module}.{action}` — e.g. `products.read`, `invoices.export`.
- Register via `permissionsService.registerPermissions([...])` in `onModuleInit`. It is idempotent; assign the newly registered permissions to roles explicitly.
- Protect endpoints: `@UseGuards(SessionAuthGuard, PermissionsGuard)` + `@RequirePermissions(...)`.
- For auth-only (no specific permission): `@UseGuards(SessionAuthGuard)` alone.

### Settings
- Client keys MUST be prefixed with the module name: `store.currency`, `orders.maxItems`.
- Never use unprefixed keys that could collide with core keys (`app.*`, `email.*`, `auth.*`, `files.*`, `media.*`).
- `NotificationsService` reads `app.logo` as `{{appLogoUrl}}` when rendering core templates or via `notifySystem()`; `sendEmail()` does not inject template variables.

### Files vs Media — never mix them
| | Files | Media |
|---|---|---|
| Content | Generic documents (PDF, DOC…) | Images only (jpg, png, webp, gif) |
| Access | Private by default (`isPublic` opt-in) | Always public (URL is enough) |
| Download | Protected endpoint with audit | Static URL served by `ServeStaticModule` |
| Thumbnails | None — not generated | None — not generated automatically |
| Ownership | `uploadedByUserId` + `fileOwnerUserId` | `uploadedByUserId` only |

- **NEVER** serve Files storage as static. Use separate `FILES_UPLOAD_PATH` (private) and `MEDIA_UPLOAD_PATH` (public); private storage must not be inside the public root. `UPLOADS_PATH` is rejected because it shared the roots and could expose private files. Migrate existing files manually before startup; never move or delete client data automatically.
- Media does NOT generate thumbnails. If needed, implement resize separately after an authenticated lookup, path containment check and bounded processing. `MediaService` storage/path helpers are private, not overridable hooks.
- Files/Media list calls return `PaginatedResult`, not arrays. Their service-level list/read ownership filters require a caller-supplied authenticated `userId`; never expose an endpoint that omits it. Media authorization booleans are caller assertions, not server-side permission checks. Obtain them from trusted guards/roles only. Files `fileOwnerUserId` defaults to null, not the uploader. Media URLs are public paths relative to the API origin.
- All images in Media are public. For private images, use Files.

### Extension points — approved patterns only
| Need | Correct pattern |
|---|---|
| Extra user fields (bio, phone) | 1-to-1 entity relation (`UserProfile`) |
| Custom permissions | `permissionsService.registerPermissions` in `onModuleInit` |
| Custom settings | Seed new `SettingCategory` + `Setting` with prefixed keys |
| Domain taxonomies | Use `TaxonomiesService` with a custom `type` string |
| Custom notifications | Create type/template via authenticated admin API, add own `@OnEvent` listener, call `NotificationsService.notifySystem()` only when no recipient preference check is required |
| Tenant authorization | Compose a separate tenant guard with `SessionAuthGuard` and `PermissionsGuard` on protected routes; design its own tenant check |
| Different Media storage | Not a supported `MediaService` subclass extension; use a separate implementation or change the core explicitly |
| Custom user preferences | Extend `BaseUserPreferencesService<T>` with own entity |

### What MUST NOT be done
- Do NOT extend TypeORM core entities via inheritance for domain modeling — TypeORM doesn't support it cross-package.
- Do NOT import from internal paths (e.g. `@dh/backend-core/dist/modules/...`); these are not public exports and couple consumers to the package layout. Use the published `NotificationsService` and the authenticated admin endpoints for type/template management.
- Do NOT assume Files storage is publicly accessible; reject any configuration that places it under the Media static root.
- `FilesService.update/remove` load the active user by the supplied ID and enforce `files.edit/files.delete` (system users bypass). Pass only the authenticated user's ID; the service argument alone is not proof of authentication. Keep the controller guards as defense in depth.
- Do NOT assume Media generates thumbnails automatically.
- Do NOT use core Setting keys without the documented prefix.
- Do NOT write seeds that run before `runCoreSeeds`.
- Do NOT couple to undocumented internals of `CoreModule`.

---

## Decision Gates

**Need to add data to a User?**
→ Does `avatarUrl` or existing `UserPreference` fields cover it? If yes, use them.
→ If not, create a `UserProfile` 1-to-1 entity. Never extend `User`.

**Need to store a file?**
→ Is it an image that should be publicly accessible? → `MediaService`
→ Is it a document / private file? → `FilesService`

**Need to notify a user?**
→ Is it a user lifecycle event? → The core flows already emit their events; do not emit duplicates after calling them.
→ Is it a domain event (`order.created`)? → Create the type/template through the admin API, register your own `@OnEvent` listener, and decide whether recipient preferences must be checked. `notifySystem()` bypasses them.

**Need to add configuration?**
→ Will it be edited at runtime from the admin panel? → Seed a `Setting` with a prefixed key.
→ Is it fixed per deployment? → Use an environment variable.

**Need to reuse a core export?**
→ Is it transversal and stable (pagination, errors, auth decorators, slugs)? → Reuse it.
→ Is it specific to core internals or a single implementation detail? → Model it yourself.

---

## Execution Steps

When implementing any feature in a `@dh/backend-core` consumer project:

1. **Check docs first.** Before writing any code related to a core capability, verify the contract in `docs/backend-client/` (or `node_modules/@dh/backend-core/docs/backend-client/`).
2. **Reuse before extending.** Use the published injectable service as-is; do not subclass private implementation details.
3. **Replace only with justification.** Compose new guards/services for domain-specific requirements (e.g. multi-tenancy) and document their boundary; do not replace global guards without accounting for public routes.
4. **Register deliberately.** Register permissions in `onModuleInit` and assign them to roles. Create notification types/templates through authenticated admin endpoints; custom events need their own listener.
5. **Seed in order.** `runCoreSeeds` → client seeds. No exception.
6. **Generate a migration** for every new entity or column. Never rely on `synchronize: true`.
7. **Audit custom actions.** Check whether the specific core method writes an audit event; do not assume every core service call does. Add audit logging to custom actions where your requirements need it.

---

## Output Contract

After any task in a core consumer project, the agent MUST:
- Confirm that no core contract listed in Hard Rules was violated.
- Flag any deviation from extension points as a risk requiring explicit justification.
- Not silently omit `runCoreSeeds` order, `CORE_ENTITIES` spread, or `credentials: true`.

---

## References

- `docs/backend-client/00-setup.md` — Bootstrap, AppModule, main.ts, seeds, data-source
- `docs/backend-client/01-permissions.md` — Permission registration and guard usage
- `docs/backend-client/02-audit.md` — AuditService API and conventions
- `docs/backend-client/03-settings.md` — Setting keys, client seeds, core key list
- `docs/backend-client/files.md` — FilesService API, ownership model, storage layout
- `docs/backend-client/media.md` — MediaService API, public access model, extension
- `docs/backend-client/notifications.md` — Events, NotificationType registration, listener pattern
- `docs/backend-client/overrides.md` — All supported extension patterns with examples
- `docs/backend-client/reuse-core-exports.md` — What to reuse vs what to model locally
- `docs/backend-client/taxonomies.md` — TaxonomiesService API, `type` convention, pivot table
- `docs/backend-client/user-preferences.md` — BaseUserPreferencesService extension pattern
- `docs/backend-client/exports.md` — Full export inventory
