# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

Sin cambios posteriores a `v2.0.0`. El tag `v1.0.0` no fue publicado en este repositorio.

## [2.0.0] - 2026-10-20

### Breaking Changes

- El paquete pasa a **ESM-only** (`"type": "module"`, TypeScript `NodeNext` y una sola entrada ESM). Los clientes nuevos deben usar ESM y imports relativos `.js`; CommonJS no es un formato de salida de esta versión. La línea `1.0.0` conserva su contrato CommonJS.
- El core deja de versionar `dist/`: al instalar desde Git, pnpm compila el paquete con `prepare`. El consumidor de pnpm 12 debe autorizar el build del **SHA Git exacto** en `allowBuilds` y clasificar los scripts transitivos; ver [setup del cliente](./docs/backend-client/00-setup.md#autorización-de-build-al-instalar-desde-git).
- Los scripts de TypeORM y seeds ejecutan TypeScript ESM; el verificador de instalación también usa ESM. Migraciones y seeds de un cliente existente requieren revisar su historial antes de ejecutarlos.

### Verified locally

- Instalación Git desde un commit sin `dist` rastreado, build del paquete, imports ESM, renderizado de notificaciones y documentación/skill empaquetados.
- `test-app` ESM y base PostgreSQL nueva y aislada: migraciones empaquetadas, seeds idempotentes y arranque del contexto Nest. **No** se probó en el cliente real.

## [1.0.0] - pendiente de publicación

Primera versión estable de `@dh/backend-core`. Se consume desde el repositorio privado mediante el tag inmutable `v1.0.0`, una vez publicado; no está disponible en un registry. Los cambios siguientes son respecto de la entrada histórica `0.1.0`.

### Added

- **`deletedAt` en `User`**: nuevo campo `@DeleteDateColumn()` en la entidad `User` — registra timestamp de baja formal. Habilita `softDelete()`, `restore()` y `withDeleted()` de TypeORM. Complementa `isActive`: ambos campos coexisten con semántica diferente (`isActive: false` + `deletedAt: null` = inactivo temporal; `deletedAt: timestamp` = dado de baja formalmente)
- **Migración `1733500000102`**: agrega columna `deletedAt TIMESTAMP NULL` a `users` con índice parcial `IDX_users_deletedAt` (`WHERE deletedAt IS NOT NULL`)
- **`inputType: 'image'`**: nuevo tipo en settings — guarda UUID del media en `value`; el servicio resuelve `url` y `alt` desde el media y los inyecta en `meta` al leer (sin segundo request desde el cliente)
- **`Session` entity**: nueva entidad `sessions` en DB — UUID opaco hasheado con SHA-256, TTL configurable, revocación inmediata
- **`SessionStrategy`**: estrategia Passport custom que valida sesiones en DB (reemplaza `JwtStrategy`)
- **`SessionAuthGuard`**: guard que reemplaza `JwtAuthGuard` en todos los controladores
- **`AuthConfig.sessionExpiration`**: nuevo campo — duración de sesión en días (default: `365`)
- **Migración `1733500000018`**: crea tabla `sessions`, elimina `refresh_tokens`

### Changed

- **Contrato de instalación para NestJS 12**: el core y sus clientes nuevos requieren TypeORM `^1.1.0`, `@nestjs/typeorm` `^12.0.0`, Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` y target ES2023.
- **Instalación limpia verificable**: `pnpm verify:fresh-install` ejecuta las migraciones
  empaquetadas y los seeds idempotentes contra una base PostgreSQL descartable.
- **PermissionsGuard**: soporta lógica OR además de AND — si un endpoint usa `@RequireAnyPermission`, el usuario necesita al menos uno de los permisos especificados
- **`@RequireAnyPermission(...)`**: nuevo decorator para proteger endpoints con lógica OR (complementa `@RequirePermissions` que sigue siendo AND)
- **`GET /roles/list`**: ahora acepta `roles.read` OR `users.read` — permite que usuarios con gestión de usuarios pero sin acceso completo a roles puedan obtener el listado para asignación

### Breaking Changes

- **Storage separado**: `UPLOADS_PATH` ya no se acepta; configurar `FILES_UPLOAD_PATH` privado y `MEDIA_UPLOAD_PATH` público por separado. Los archivos existentes requieren una migración manual antes de arrancar; el core no los mueve automáticamente.
- **TypeORM 0.3 ya no es compatible**: los clientes nuevos deben instalar TypeORM 1.1 y usar
  find options con relaciones en sintaxis objeto.
- **Sistema JWT eliminado**: `JwtAuthGuard`, `JwtStrategy`, `JwtModule` y `@nestjs/jwt` ya no forman parte del sistema de auth. Reemplazados por sesiones server-side con UUID opaco.
- **`POST /auth/refresh` eliminado**: ya no existe. Las sesiones no requieren refresh.
- **`AuthConfig`**: los campos `jwtSecret`, `jwtExpiration`, `jwtRefreshSecret`, `jwtRefreshExpiration` fueron eliminados. Usar `sessionExpiration` en su lugar.
- **`AuthResponseDto`**: ya no contiene `accessToken` ni `refreshToken`. Contiene `sessionId` y `user`.
- **`TokensDto` eliminado**.
- **`RefreshToken` entity eliminada**: reemplazada por `Session`.
- **Cookie `access_token` y `refresh_token` eliminadas**: reemplazadas por cookie única `session_id`.
- **Export público `JwtAuthGuard`**: reemplazado por `SessionAuthGuard` en `src/index.ts`.
- **`CORE_ENTITIES`**: `RefreshToken` reemplazada por `Session`.

## [0.1.0] - 2026-04-11

### Módulos implementados

#### Core Infrastructure

- **CoreModule** con configuración dinámica via `CoreModule.register()`
- **DatabaseModule** con soporte para PostgreSQL + TypeORM
- **HealthModule** para monitoreo del estado del sistema
- Sistema de excepciones consistente con `ApiException` y `ErrorCode`
- Interceptor de respuestas estandarizado con formato `{ success, data, error }`
- Documentación OpenAPI/Swagger automática

#### Autenticación y Autorización

- **AuthModule** con login JWT (access + refresh tokens)
- **UsersModule** con gestión completa de usuarios
  - Usuario del sistema (isSystemUser) único e inmutable
  - Usuarios protegidos (isProtected) no eliminables
  - Hash de passwords con bcrypt
- **RolesModule** con gestión de roles
  - Roles protegidos (SuperAdmin, Admin)
  - Sistema de peso (weight) para jerarquía
- **PermissionsModule** con permisos granulares
  - Registro automático de permisos desde módulos
  - Asignación dinámica a roles
- Guards: `JwtAuthGuard`, `PermissionsGuard`
- Decorators: `@CurrentUser()`, `@RequirePermissions()`, `@Public()`

#### Auditoría

- **AuditModule** con registro automático de acciones
- Interceptor `AuditContextInterceptor` con `nestjs-cls`
- Metadata completa: userId, action, entity, entityId, ip, userAgent
- Decorador `@Auditable()` para endpoints

#### Datos y Configuración

- **SettingsModule** con configuración persistente
  - Categorías de settings (General, Email, Archivos, Imágenes)
  - Tipos: string, number, boolean, json, array
  - Settings predefinidos para Files y Media
- **TaxonomiesModule** para clasificación reutilizable
  - Tipos personalizables (categories, tags, etc.)
  - Slug automático para URLs amigables
  - Relación many-to-many con cualquier entidad

#### Archivos y Media

- **FilesModule** para archivos genéricos privados
  - Ownership dual: uploadedByUserId + fileOwnerUserId
  - Control de acceso: público/privado
  - Validación dinámica desde Settings
  - Contador de descargas con auditoría
  - Storage local con path organizado por usuario/usage/fecha
- **MediaModule** para imágenes públicas
  - URLs públicas directas (servidas como estáticas)
  - Procesamiento con Sharp: extracción automática de width/height
  - Alt text obligatorio (SEO/accesibilidad)
  - Validación dinámica desde Settings
  - Storage local con organización por usuario/usage/fecha

#### Notificaciones

- **NotificationsModule** con sistema de templates
  - Templates base: welcome, password-reset, email-verification
  - Renderizado con MJML (emails responsivos)
  - Headers y footers reutilizables
  - Tipos de notificación configurables
- **EmailProvidersModule** para gestión de proveedores SMTP
  - Soporte para múltiples proveedores (SMTP, Resend)
  - Validación de credenciales
  - Configuración dinámica por proyecto

### Features

- ✅ Sistema de migraciones con TypeORM
- ✅ Seeds para datos iniciales (roles, permisos, settings, usuarios)
- ✅ Scripts de desarrollo (start:dev, migration:run, seed)
- ✅ Tests unitarios (42 tests passing)
- ✅ Documentación completa (frontend + backend-client)
- ✅ Configuración de ESLint + Prettier
- ✅ Soporte para desarrollo con Podman/Docker

### Ideas futuras de la etapa 0.1.0 (no forman parte de 1.0.0)

- [ ] Tests e2e para Files y Media
- [ ] Abstracción de storage para S3 (Files + Media)
- [ ] Sistema de queues para envío asíncrono de emails
- [ ] Rate limiting para endpoints públicos
- [ ] Compresión de imágenes automática en Media
- [ ] Thumbnails on-demand o precalculados en Media

La versión estable se distribuirá por tags Git del repositorio privado; la publicación en un registry no forma parte de este plan.

## Notas de migración

### Desde ninguna versión anterior (proyecto nuevo)

1. Instalar dependencias: `pnpm install`
2. Configurar `.env` siguiendo `.env.example`
3. Ejecutar migraciones: `pnpm migration:run`
4. Ejecutar seeds: `pnpm seed`
5. Iniciar en desarrollo: `pnpm start:dev`

---

[Unreleased]: https://github.com/DH-Multimedios/cms-backend-core/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/DH-Multimedios/cms-backend-core/releases/tag/v1.0.0
[0.1.0]: https://github.com/DH-Multimedios/cms-backend-core/releases/tag/v0.1.0
