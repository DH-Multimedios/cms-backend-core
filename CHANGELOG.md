# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

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

### Pendiente para 1.0.0

- [ ] Tests e2e para Files y Media
- [ ] Abstracción de storage para S3 (Files + Media)
- [ ] Sistema de queues para envío asíncrono de emails
- [ ] Rate limiting para endpoints públicos
- [ ] Compresión de imágenes automática en Media
- [ ] Thumbnails on-demand o precalculados en Media
- [ ] Publicación a npm registry privado

## Notas de migración

### Desde ninguna versión anterior (proyecto nuevo)

1. Instalar dependencias: `pnpm install`
2. Configurar `.env` siguiendo `.env.example`
3. Ejecutar migraciones: `pnpm migration:run`
4. Ejecutar seeds: `pnpm seed`
5. Iniciar en desarrollo: `pnpm start:dev`

---

[Unreleased]: https://github.com/DH-Multimedios/cms-backend-core/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/DH-Multimedios/cms-backend-core/releases/tag/v0.1.0
