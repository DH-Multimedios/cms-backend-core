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

Este backend soporta **dos modos de autenticación** según el cliente:

```
1. Browser / web app (recomendado): cookies HttpOnly
2. Mobile / clientes no-browser: header X-Session-Id
```

### Browser / web app

- Login setea la cookie HttpOnly `session_id` automáticamente
- En `fetch`, enviar `credentials: 'include'`
- No hace falta guardar tokens en storage

### Mobile / clientes no-browser (Flutter)

- Usar el `sessionId` devuelto en el body del login:

```
X-Session-Id: <sessionId>
```

Los endpoints marcados como `@Public` no requieren autenticación.

---

## Estructura de respuesta

### Respuesta exitosa (2xx)

```json
{
  "statusCode": 200,
  "data": { ... }
}
```

### Respuesta exitosa paginada

```json
{
  "statusCode": 200,
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Respuesta de error

Errores del dominio (validaciones, permisos, recursos no encontrados, etc.):

```json
{
  "statusCode": 409,
  "code": "USER_EMAIL_TAKEN",
  "message": "El email ya está en uso"
}
```

Errores de validación de class-validator (campos inválidos):

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "email must be an email; password must be longer than or equal to 8 characters"
}
```

Error inesperado del servidor:

```json
{
  "statusCode": 500,
  "code": "INTERNAL_ERROR",
  "message": "Internal server error"
}
```

---

## Manejo de errores en el frontend

### Interceptor recomendado

```typescript
async function apiFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include', // ← necesario para cookies HttpOnly
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  // Si la sesión expiró o fue revocada → redirigir a login
  if (res.status === 401) {
    window.location.href = '/login';
    return;
  }

  const body = await res.json();

  if (!res.ok) {
    // Estructura: { statusCode, code, message }
    throw new ApiError(body.statusCode, body.code, body.message);
  }

  // Estructura: { statusCode, data }
  return body.data;
}

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
```

### Interpretar los códigos de error

```typescript
try {
  const user = await apiFetch('/api/users/me');
} catch (err) {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'INVALID_CREDENTIALS':
        // Email o contraseña incorrectos
        break;
      case 'USER_EMAIL_TAKEN':
        // El email ya existe → sugerir otro
        break;
      case 'VALIDATION_ERROR':
        // Campos inválidos → err.message tiene el detalle
        break;
      case 'FORBIDDEN':
        // Sin permisos
        break;
      // ...
    }
  }
}
```

### Errores de validación

Cuando class-validator rechaza un request, el `message` contiene todos los errores concatenados con `;`:

```
"username must be longer than or equal to 3 characters; email must be an email"
```

Para mostrar errores por campo, splitear el mensaje:

```typescript
const fieldErrors = err.message.split('; ').reduce((acc, msg) => {
  const [field] = msg.split(' ');
  acc[field] = msg;
  return acc;
}, {});
// { username: "username must be longer than or equal to 3 characters", email: "email must be an email" }
```

---

## Códigos de error

| code                      | HTTP | Descripción                                                |
| ------------------------- | ---- | ---------------------------------------------------------- |
| `INVALID_CREDENTIALS`     | 401  | Email/password incorrectos                                 |
| `USER_NOT_FOUND`          | 404  | Usuario no encontrado                                      |
| `USER_EMAIL_TAKEN`        | 409  | El email ya está en uso                                    |
| `USERNAME_TAKEN`          | 409  | El username ya está en uso                                 |
| `USER_PROTECTED`          | 409  | El usuario está protegido (no se puede modificar/eliminar) |
| `ROLE_NOT_FOUND`          | 404  | Rol no encontrado                                          |
| `ROLE_NAME_TAKEN`         | 409  | El nombre de rol ya existe                                 |
| `ROLE_PROTECTED`          | 409  | El rol está protegido                                      |
| `ROLE_WEIGHT_EXCEEDED`    | 403  | El rol tiene más peso que el usuario que lo asigna         |
| `PERMISSION_NOT_FOUND`    | 404  | Permiso no encontrado                                      |
| `TAXONOMY_NOT_FOUND`      | 404  | Taxonomía no encontrada                                    |
| `TAXONOMY_SLUG_EXISTS`    | 409  | El slug ya existe en ese tipo                              |
| `TAXONOMY_HAS_CHILDREN`   | 409  | No se puede eliminar una taxonomía con hijos               |
| `TAXONOMY_INVALID_PARENT` | 400  | Padre inválido (crear un ciclo o hije de sí mismo)         |
| `NOT_FOUND`               | 404  | Recurso genérico no encontrado                             |
| `FORBIDDEN`               | 403  | Sin permisos para esta acción                              |
| `CONFLICT`                | 409  | Conflicto de datos genérico                                |
| `VALIDATION_ERROR`        | 400  | Error de validación de datos                               |
| `INTERNAL_ERROR`          | 500  | Error inesperado del servidor                              |

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
