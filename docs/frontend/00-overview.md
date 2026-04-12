# API Overview — Guía para el frontend

Convenciones globales que aplican a todos los endpoints del backend-core.

---

## Base URL

```
http://localhost:3000   (desarrollo)
https://api.tudominio.com  (producción)
```

---

## Autenticación

Todos los endpoints protegidos requieren el JWT en el header:

```
Authorization: Bearer <accessToken>
```

Los endpoints marcados como `@Public` no requieren el header.

---

## Estructura de respuesta

Todas las respuestas siguen el mismo envelope:

### Respuesta exitosa

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-04-11T15:30:00.000Z"
}
```

### Respuesta paginada

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  },
  "timestamp": "..."
}
```

### Respuesta de error

```json
{
  "success": false,
  "error": {
    "statusCode": 404,
    "code": "USER_NOT_FOUND",
    "message": "Usuario no encontrado"
  },
  "timestamp": "..."
}
```

---

## Códigos de error

| code                    | HTTP | Descripción                                        |
| ----------------------- | ---- | -------------------------------------------------- |
| `INVALID_CREDENTIALS`   | 401  | Email/password incorrectos                         |
| `INVALID_REFRESH_TOKEN` | 401  | Refresh token inválido, expirado o revocado        |
| `USER_NOT_FOUND`        | 404  | Usuario no encontrado                              |
| `USER_EMAIL_TAKEN`      | 409  | El email ya está en uso                            |
| `USERNAME_TAKEN`        | 409  | El username ya está en uso                         |
| `USER_PROTECTED`        | 409  | El usuario está protegido (no se puede eliminar)   |
| `ROLE_NOT_FOUND`        | 404  | Rol no encontrado                                  |
| `ROLE_NAME_TAKEN`       | 409  | El nombre de rol ya existe                         |
| `ROLE_PROTECTED`        | 409  | El rol está protegido                              |
| `ROLE_WEIGHT_EXCEEDED`  | 403  | El rol tiene más peso que el usuario que lo asigna |
| `PERMISSION_NOT_FOUND`  | 404  | Permiso no encontrado                              |
| `NOT_FOUND`             | 404  | Recurso no encontrado                              |
| `CONFLICT`              | 409  | Conflicto de datos                                 |
| `FORBIDDEN`             | 403  | Sin permisos para esta acción                      |
| `VALIDATION_ERROR`      | 400  | Error de validación de datos                       |

---

## Paginación

Los endpoints que devuelven listas aceptan query params:

| Param       | Tipo            | Default | Descripción           |
| ----------- | --------------- | ------- | --------------------- |
| `page`      | number          | 1       | Página actual         |
| `limit`     | number          | 20      | Items por página      |
| `sortBy`    | string          | varía   | Campo de ordenamiento |
| `sortOrder` | `ASC` \| `DESC` | `DESC`  | Dirección             |

```
GET /users?page=2&limit=10&sortBy=createdAt&sortOrder=DESC
```

---

## Módulos disponibles

| Módulo                   | Endpoints                              | Auth requerida |
| ------------------------ | -------------------------------------- | -------------- |
| Auth                     | `/auth/*`                              | Mixto          |
| Users                    | `/users/*`                             | Sí             |
| Roles                    | `/roles/*`                             | Sí             |
| Permissions              | `/permissions`                         | Sí             |
| Settings                 | `/settings/*`, `/setting-categories/*` | Mixto          |
| Taxonomies               | `/taxonomies/*`                        | Sí             |
| Files                    | `/files/*`                             | Mixto          |
| Media                    | `/media/*`                             | Mixto          |
| Email Providers          | `/email-providers/*`                   | Sí             |
| Email Layouts            | `/email-layouts/*`                     | Sí             |
| Email Templates          | `/email-templates/*`                   | Sí             |
| Notification Types       | `/notification-types/*`                | Mixto          |
| Notification Preferences | `/notification-preferences/*`          | Sí             |
| User Preferences         | `/user-preferences/*`                  | Sí             |
| Audit                    | `/audit/*`                             | Sí             |
| Health                   | `/health`                              | No             |
