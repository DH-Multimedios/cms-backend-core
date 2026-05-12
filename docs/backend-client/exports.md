# Exports de `@dh/backend-core`

Inventario completo de lo que la librería expone al cliente NestJS.

---

## Módulo raíz

| Export | Tipo |
|---|---|
| `CoreModule` | Módulo NestJS principal — registra toda la infraestructura |
| `CoreModuleConfig` / `CoreModuleAsyncOptions` | Interfaces de configuración |
| `DatabaseConfig`, `AuthConfig`, `ModulesConfig` | Sub-interfaces de config |
| `FilesModuleConfig`, `MediaModuleConfig`, `NotificationsModuleConfig` | Config específica por módulo |

---

## Entidades TypeORM (`CORE_ENTITIES`)

`User`, `Role`, `Permission`, `Session`, `AuditLog`, `Taxonomy`, `EntityTaxonomy`, `File`, `Media`, `Setting`, `SettingCategory`, `EmailProvider`, `EmailLayout`, `EmailTemplate`, `NotificationType`, `UserNotificationPreference`, `UserPreference`, `PasswordResetToken`

El array `CORE_ENTITIES` se puede pasar directo al `DataSource`:

```ts
import { CORE_ENTITIES } from '@dh/backend-core';

entities: [...CORE_ENTITIES, ...misEntidades]
```

**Tipos de email-provider:** `EmailProviderType`, `EmailProviderConfigUnion`, `SmtpConfig`, `ResendConfig`, `GoogleOAuthConfig`

**Tipos de notification blocks:** `Section`, `Column`, `Block`, `TextBlock`, `HeadingBlock`, `ButtonBlock`, `ImageBlock`, `DividerBlock`, `SpacerBlock`

---

## Auth

| Export | Tipo |
|---|---|
| `AuthModule` | Módulo |
| `AuthService` | Servicio |
| `SessionAuthGuard` | Guard (sesión por cookie) |
| `LocalAuthGuard` | Guard (login local) |
| `PermissionsGuard` | Guard (permisos) |
| `CurrentUser` | Decorator |
| `RequirePermissions` | Decorator |
| `Public` | Decorator |

---

## Users

`UsersModule`, `UsersService`, `UserCreatedEvent`, `UserResponseDto`, `CreateUserDto`, `UpdateUserDto`, `UpdateProfileDto`

---

## Roles & Permissions

`RolesModule`, `RolesService`, `PermissionsModule`, `PermissionsService`, `PermissionDefinition` (type)

---

## Audit

`AuditModule`, `AuditService`, `AuditLogOptions` (type)

---

## Settings

`SettingsModule`, `SettingsService`, `CreateSettingDto`, `UpdateSettingDto`, `CreateCategoryDto`, `UpdateCategoryDto`

---

## Taxonomies

`TaxonomiesModule`, `TaxonomiesService`, `CreateTaxonomyDto`, `UpdateTaxonomyDto`, `QueryTaxonomyDto`, `SyncEntityTaxonomiesDto`

---

## Email Providers

`EmailProvidersModule`, `EmailProvidersService`, `CreateEmailProviderDto`, `UpdateEmailProviderDto`

---

## Files & Media

**Files:** `FilesModule`, `FilesService`, `UploadFileDto`, `UpdateFileDto`, `ListFilesDto`

**Media:** `MediaModule`, `MediaService`, `UploadMediaDto`, `UpdateMediaDto`, `ListMediaDto`

---

## Notifications & Preferencias de usuario

`NotificationsModule`, `NotificationsService`

`UserPreferencesModule`, `UserPreferencesService`, `BaseUserPreferencesService`, `UpdateUserPreferenceDto`, `ThemePreference` (type)

---

## Common / Utils

| Export | Tipo |
|---|---|
| `generateSlug` | Función utilitaria |
| `PaginationDto` | DTO de paginación |
| `PaginatedResult` | Interface de resultado paginado |
| `ApiException` | Excepción customizada |
| `ErrorCode` | Enum de códigos de error |
| `HttpExceptionFilter` | Filter global |
| `ResponseInterceptor` | Interceptor global |
| `ApiResponse` | Type de respuesta envuelta |

---

## Seeds

`runCoreSeeds`, `ExtraRole` (type), `CoreSeedOptions` (type)

---

## Resumen

| Categoría | Cantidad |
|---|---|
| Módulos NestJS | 15 |
| Entidades TypeORM | 18 |
| Guards | 3 |
| Decorators | 3 |
| Servicios | 11 |
| DTOs | 20+ |
| Utils / Common | 8 |
