# Plan de Implementación - @dh/backend-core

## Visión General

Core reutilizable para APIs en NestJS que centraliza:
- Autenticación y autorización
- Gestión de usuarios y roles
- Auditoría
- Taxonomías, Files, Media
- Settings y Notificaciones

**Objetivo**: Reducir duplicación, acelerar desarrollo, mantener consistencia entre proyectos.

---

## Etapa 0 — Definición (ANTES de codear)

**Duración**: 1-2 días

### Tareas

- [ ] Definir API exacta de `CoreModule.register()`
- [ ] Definir todas las entidades del core (Users, Roles, Permissions, etc.)
- [ ] Definir estructura de carpetas del proyecto
- [ ] Definir convenciones de código (ESLint, Prettier)
- [ ] Crear repositorio + setup inicial (NestJS + TypeORM + PostgreSQL)
- [ ] Configurar Docker/Podman para desarrollo
- [ ] Configurar variables de entorno (.env.example)

### Entregable

- Proyecto NestJS inicializado
- Configuración de TypeORM lista
- Estructura de carpetas definida
- README inicial con instrucciones de setup

---

## Etapa 1 — Base del sistema

**Duración**: 2-3 días

### Tareas

- [ ] Configurar TypeORM + PostgreSQL
- [ ] Crear `CoreModule` con configuración dinámica
- [ ] Crear módulo `DatabaseModule`
- [ ] Primera migración (tabla users base)
- [ ] Seed script para datos iniciales
- [ ] Script de CLI para correr seeds (`npm run seed`)

### Entregable

Proyecto arranca, se conecta a DB, corre migraciones.

---

## Etapa 2 — Identidad y acceso (CRÍTICO)

**Duración**: 5-7 días

### 2.1 Users

- [ ] Entidad `User` (id, email, password, isActive, isSystemUser, isProtected, createdAt, updatedAt)
- [ ] CRUD de usuarios (sin auth todavía)
- [ ] Validaciones (DTOs con class-validator)
- [ ] Hash de passwords (bcrypt)
- [ ] Tests unitarios de UserService

### 2.2 Roles & Permissions

- [ ] Entidad `Role` (id, name, description, weight, isProtected, createdAt, updatedAt)
- [ ] Entidad `Permission` (id, name, description, module, createdAt, updatedAt)
- [ ] Relación `user_roles` (many-to-many)
- [ ] Relación `role_permissions` (many-to-many)
- [ ] CRUD de roles
- [ ] CRUD de permisos
- [ ] Método `PermissionService.registerPermissions()` para registro automático
- [ ] Seed para roles base (`SuperAdmin`, `Admin`)
- [ ] Seed para permisos base del core
- [ ] Tests

### 2.3 Auth

- [ ] Login (email + password → sesión server-side)
- [ ] Guards de autenticación (`SessionAuthGuard`)
- [ ] Guards de permisos (`PermissionsGuard`)
- [ ] Decorators (`@CurrentUser()`, `@RequirePermissions()`)
- [ ] Revocación e invalidación de sesiones
- [ ] Protección del usuario del sistema (invisible, inmutable)
- [ ] Tests de integración (login, guards, permisos)

### 2.4 Seeds de seguridad

- [ ] Usuario del sistema (isSystemUser=true, email desde env)
- [ ] SuperAdmin del cliente (email/password desde env)
- [ ] Admin del cliente (email/password desde env)
- [ ] Validación: solo UN usuario con isSystemUser=true

### Entregable

Sistema autenticado funcional. Se puede crear usuarios, asignar roles, hacer login, proteger endpoints.

---

## Etapa 3 — Infraestructura común

**Duración**: 2-3 días

### Tareas

- [ ] DTO de paginación (`PaginationDto`)
- [ ] Helper de paginación (`paginate()`)
- [ ] Formato de respuestas estándar (`ResponseDto<T>`)
- [ ] Exception filters personalizados (HttpExceptionFilter)
- [ ] DTOs base reutilizables
- [ ] Integración con Swagger
- [ ] Decorators de Swagger para documentación automática
- [ ] Tests

### Entregable

Todos los endpoints devuelven respuestas consistentes, paginadas, documentadas en Swagger.

---

## Etapa 4 — Auditoría

**Duración**: 2 días

### Tareas

- [ ] Entidad `AuditLog` (id, userId, action, entity, entityId, metadata, ip, userAgent, createdAt)
- [ ] Interceptor para logear acciones automáticamente
- [ ] Decorator `@Auditable()` para marcar endpoints
- [ ] Endpoint para consultar logs (solo usuario del sistema + SuperAdmin)
- [ ] Filtros de búsqueda (por usuario, acción, entidad, fecha)
- [ ] Tests

### Entregable

Se registran acciones importantes del sistema (login, CRUD de usuarios/roles, etc.).

---

## Etapa 5 — Health checks

**Duración**: 1 día

### Tareas

- [ ] Endpoint `/health`
- [ ] Check de conexión a DB
- [ ] Check de servicios críticos (opcional)
- [ ] Integración con @nestjs/terminus
- [ ] Tests

### Entregable

Endpoint `/health` que devuelve estado del sistema.

---

## Etapa 6 — Files

**Duración**: 3 días

### Tareas

- [ ] Entidad `File` (id, filename, originalName, mimetype, size, path, uploadedBy, createdAt)
- [ ] Upload de archivos (Multer + local storage)
- [ ] Download de archivos
- [ ] Validación de tipos permitidos
- [ ] Validación de tamaño máximo
- [ ] Abstracción de storage (interfaz para futuro S3)
- [ ] Tests

### Entregable

Sistema de archivos funcional con upload/download local.

---

## Etapa 7 — Media

**Duración**: 3 días

### Tareas

- [ ] Entidad `Media` (id, filename, originalName, mimetype, size, path, alt, width, height, uploadedBy, createdAt)
- [ ] Upload de imágenes (Multer + local storage)
- [ ] Procesamiento básico con Sharp (resize opcional)
- [ ] Validación de tipos (solo imágenes)
- [ ] Extracción de metadata (dimensiones)
- [ ] Tests

### Entregable

Sistema de imágenes funcional con upload y metadata.

---

## Etapa 8 — Taxonomies (SIN acoplamiento a Media)

**Duración**: 2-3 días

### Tareas

- [ ] Entidad `Taxonomy` (id, name, slug, type, description, imageId nullable, createdAt, updatedAt)
- [ ] CRUD de taxonomías
- [ ] Filtrado por type
- [ ] Endpoints con composición opcional de imagen (en controlador)
- [ ] Método `findForEntity(entityType, entityId)` para relaciones
- [ ] Tests

### Entregable

Sistema de taxonomías funcional, preparado para usarse en módulos de negocio.

---

## Etapa 9 — Settings

**Duración**: 1-2 días

### Tareas

- [ ] Entidad `Setting` (id, key, value, description, type, createdAt, updatedAt)
- [ ] CRUD de settings
- [ ] Service con método `getSetting(key, defaultValue?)`
- [ ] Cache de settings en memoria (opcional)
- [ ] Validación de tipos (string, number, boolean, json)
- [ ] Tests

### Entregable

Sistema de configuración persistente del sistema.

---

## Etapa 10 — Notificaciones

**Duración**: 2-3 días

### Tareas

- [ ] Módulo de notificaciones con EventEmitter
- [ ] Provider de email (SMTP con Nodemailer)
- [ ] Sistema de templates (Handlebars o similar)
- [ ] Templates base (welcome, password-reset, etc.)
- [ ] Queue opcional (Bull) para envío asíncrono
- [ ] Tests

### Entregable

Sistema de notificaciones funcional con envío de emails.

---

## Etapa 11 — Proyecto piloto

**Duración**: 3-5 días

### Tareas

- [ ] Crear proyecto nuevo consumiendo el core
- [ ] Implementar un módulo de negocio (ej: Products)
- [ ] Usar taxonomías para categorías de productos
- [ ] Integrar media para imágenes de productos
- [ ] Probar todos los guards y permisos
- [ ] Documentar problemas encontrados
- [ ] Validar que la API del core es cómoda

### Entregable

Proyecto real funcionando con el core, feedback documentado.

---

## Etapa 12 — Ajustes

**Duración**: 2-3 días

### Tareas

- [ ] Refactor basado en feedback del piloto
- [ ] Mejorar DX (developer experience)
- [ ] Completar tests faltantes
- [ ] Documentación final (README, docs/frontend, docs/client)
- [ ] Preparar ejemplos de uso

### Entregable

Core estable y listo para usar en producción.

---

## Etapa 13 — Release 1.0.0

### Tareas

- [ ] Publicar versión 1.0.0
- [ ] README completo con ejemplos
- [ ] Docs de la API
- [ ] Guía de migración (si aplica)
- [ ] CHANGELOG
- [ ] Tagear release en Git

### Entregable

Primera versión estable publicada y lista para usar en múltiples proyectos.

---

## Estimación Total

- **Etapas 0-10**: ~28-38 días de desarrollo
- **Etapas 11-13**: ~7-10 días de validación y ajustes
- **Total**: **7-9 semanas** (asumiendo 1 dev full-time)

Si son 2 devs en paralelo: **5-6 semanas**.

---

## Próximos pasos inmediatos

1. Crear estructura del proyecto (Etapa 0)
2. Definir API de configuración del CoreModule
3. Configurar TypeORM y primera migración
4. Implementar módulo de Users + Auth
