---
name: backend-core
description: "Trigger: @dh/backend-core, CoreModule, backend core, cms-backend-core. Contracts and extension points for any NestJS project consuming @dh/backend-core."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Load this skill when the agent is working in a NestJS project that imports `@dh/backend-core`.
Applies to: module wiring, guards, permissions, seeds, migrations, files, media, notifications, settings, taxonomies, user preferences, and any extension of core services.

---

## Hard Rules

### Bootstrap (never skip)
- Register via `CoreModule.registerAsync(...)` only. Never instantiate modules manually.
- `ConfigModule.forRoot({ isGlobal: true })` MUST be imported before `CoreModule`.
- `synchronize: false` is mandatory in all environments.
- `runCoreSeeds(AppDataSource)` MUST run BEFORE any client seed. Order is non-negotiable.
- `data-source.ts` MUST spread `...CORE_ENTITIES` first, then add client entities.
- Core migrations path (`node_modules/@dh/backend-core/dist/database/migrations/*.js`) MUST be included alongside client migrations.

### Auth / Session
- `credentials: true` in CORS is REQUIRED — without it, HttpOnly cookies are never sent.
- The core applies `cookie-parser` globally; do NOT add it again in `main.ts`.
- Session duration is driven by the `auth.sessionExpiration` Setting (days). `AuthConfig.sessionExpiration` is a fallback only, not a runtime override.
- `isSystemUser: true` bypasses all permission checks automatically — no extra code needed.

### Permissions
- Convention: `{module}.{action}` — e.g. `products.read`, `invoices.export`.
- Register via `permissionsService.registerPermissions([...])` in `onModuleInit`. It is idempotent.
- Protect endpoints: `@UseGuards(SessionAuthGuard, PermissionsGuard)` + `@RequirePermissions(...)`.
- For auth-only (no specific permission): `@UseGuards(SessionAuthGuard)` alone.

### Settings
- Client keys MUST be prefixed with the module name: `store.currency`, `orders.maxItems`.
- Never use unprefixed keys that could collide with core keys (`app.*`, `email.*`, `auth.*`, `files.*`, `media.*`).
- Known inconsistency: the seed creates `app.logo`; `NotificationsService` reads `app.logoUrl`. Do not rely on `{{appLogoUrl}}` in templates until this is fixed upstream.

### Files vs Media — never mix them
| | Files | Media |
|---|---|---|
| Content | Generic documents (PDF, DOC…) | Images only (jpg, png, webp, gif) |
| Access | Private by default (`isPublic` opt-in) | Always public (URL is enough) |
| Download | Protected endpoint with audit | Static URL served by `ServeStaticModule` |
| Thumbnails | None — not generated | None — not generated automatically |
| Ownership | `uploadedByUserId` + `fileOwnerUserId` | `uploadedByUserId` only |

- **NEVER** serve `uploads/files/` as static. Only `uploads/media/` is served statically.
- Media does NOT generate thumbnails. Implement resize on-demand via `MediaService` subclass if needed.
- All images in Media are public. For private images, use Files.

### Extension points — approved patterns only
| Need | Correct pattern |
|---|---|
| Extra user fields (bio, phone) | 1-to-1 entity relation (`UserProfile`) |
| Custom permissions | `permissionsService.registerPermissions` in `onModuleInit` |
| Custom settings | Seed new `SettingCategory` + `Setting` with prefixed keys |
| Domain taxonomies | Use `TaxonomiesService` with a custom `type` string |
| Custom notifications | Register `NotificationType` + own `@OnEvent` listener + seed template |
| Override auth guard | Extend `PermissionsGuard`, register as `APP_GUARD` |
| Extend MediaService | Subclass and override `saveImageToDisk()` / `generatePublicUrl()` |
| Custom user preferences | Extend `BaseUserPreferencesService<T>` with own entity |

### What MUST NOT be done
- Do NOT extend TypeORM core entities via inheritance for domain modeling — TypeORM doesn't support it cross-package.
- Do NOT import from internal paths (e.g. `@dh/backend-core/dist/modules/...`) unless documented — it creates fragile coupling.
  - **Exception**: `EmailSenderService` and `NotificationTypesService` are injectable via DI but not in the barrel; import from their dist path only inside a module that imports `NotificationsModule`.
- Do NOT assume `uploads/files/` is publicly accessible.
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
→ Is it a user lifecycle event (`user.created`, password reset, email verification)? → Emit the core event; core handles it.
→ Is it a domain event (`order.created`)? → Register a `NotificationType` + write your own `@OnEvent` listener.

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
2. **Reuse before extending.** Use the injectable service as-is. Extend only when the service API is insufficient.
3. **Replace only with justification.** Override guards or services only when there is a documented need (e.g. multi-tenancy). Document the reason inline.
4. **Register in `onModuleInit`.** Permissions and notification types must self-register at startup — never via manual DB inserts or migrations.
5. **Seed in order.** `runCoreSeeds` → client seeds. No exception.
6. **Generate a migration** for every new entity or column. Never rely on `synchronize: true`.
7. **Audit custom actions.** If you bypass a core service method, call `AuditService.log()` manually. If you use a core service method, auditing is automatic — do not duplicate it.

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
