# Migraciones archivadas

Este directorio contiene las 19 migraciones históricas (000–018) que fueron
consolidadas en `1733500000100-BaselineSchema.ts`.

**No eliminar** — sirven como referencia del historial de cambios y para
entender la evolución del schema.

**No ejecutar** — TypeORM no las encuentra porque el pattern del data-source
(`migrations/*.ts`) no busca en subdirectorios.

## Cuándo aplica cada grupo

| Rango | Qué hace |
|-------|---------|
| 000 | Schema inicial (users, roles, permissions, audit_logs, taxonomies, files, media, settings) |
| 001 | Tabla `refresh_tokens` (sistema JWT — reemplazado por sessions) |
| 002 | Columna `username` en users |
| 003 | `userId` nullable en audit_logs + FK SET NULL |
| 004 | Tabla `setting_categories` + columnas label/order/categoryId en settings |
| 005 | Tabla `email_providers` |
| 006 | `entityId` en audit_logs cambia de uuid a varchar |
| 007 | Rename `key` → `slug` en setting_categories |
| 008 | Columnas `inputType` y `meta` en settings |
| 009 | Tablas email_layouts, email_templates, notification_types, user_notification_preferences |
| 010 | `parentId`/`order` en taxonomies + tabla entity_taxonomies |
| 011 | Refactor files: nuevas columnas, rename uploadedBy → uploadedByUserId |
| 012 | Refactor media: url, uso, alt/width/height NOT NULL, rename uploadedBy |
| 013 | `isProtected` en settings y setting_categories |
| 014 | Tabla `user_preferences` |
| 015 | Tabla `password_reset_tokens` |
| 016 | Columna `avatarUrl` en users |
| 017 | Columna `moduleName` en permissions |
| 018 | Reemplaza `refresh_tokens` por `sessions` (migración al sistema de sesiones) |
