# Auth — Guía para el frontend

---

## Endpoints

### POST /auth/login

Autentica un usuario y devuelve tokens JWT.

**Request:**

```json
{
  "login": "admin@ejemplo.com",
  "password": "micontraseña"
}
```

> `login` acepta **email** o **username**.

**Response `200`:**

Además del body, el servidor setea automáticamente dos cookies HttpOnly:

- `access_token` — expira en 15 minutos
- `refresh_token` — expira en 7 días, solo se envía al endpoint `/auth/refresh`

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "admin@ejemplo.com",
      "username": "admin",
      "firstName": "Juan",
      "lastName": "Pérez",
      "isActive": true,
      "isProtected": false,
      "roles": [{ "id": "uuid", "name": "Admin", "weight": 90 }],
      "lastLoginAt": "2026-04-11T...",
      "createdAt": "2026-01-01T...",
      "updatedAt": "2026-04-11T..."
    }
  }
}
```

**Errores:**

| code                  | Cuándo                                           |
| --------------------- | ------------------------------------------------ |
| `INVALID_CREDENTIALS` | Email/username no existe o contraseña incorrecta |
| `FORBIDDEN`           | Usuario inactivo                                 |

---

### POST /auth/refresh

Renueva el access token usando el refresh token. Implementa **token rotation**: el refresh token usado se revoca y se genera uno nuevo.

**Request:**

```json
{ "refreshToken": "eyJhbGci..." }
```

> `refreshToken` es opcional si usás cookies — el servidor lo lee automáticamente de la cookie `refresh_token`.

**Response `200`:** Nuevos tokens en body + renueva las cookies automáticamente.

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

**Errores:**

| code                    | Cuándo                                             |
| ----------------------- | -------------------------------------------------- |
| `INVALID_REFRESH_TOKEN` | Token inválido, expirado o ya fue usado (rotación) |

> ⚠️ Cada refresh token es de **un solo uso**. Guardá el nuevo token que devuelve la respuesta.

---

### POST /auth/logout

Revoca el refresh token actual. Requiere JWT.

**Request:**

```json
{ "refreshToken": "eyJhbGci..." }
```

**Response `200`:**

```json
{
  "success": true,
  "data": { "message": "Sesión cerrada correctamente" }
}
```

---

### POST /auth/logout-all

Revoca **todos** los refresh tokens del usuario. Cierra todas las sesiones abiertas. Requiere JWT.

**Request:** (body vacío)

**Response `200`:**

```json
{
  "success": true,
  "data": { "message": "Todas las sesiones cerradas" }
}
```

---

### GET /auth/me

Devuelve el usuario autenticado con sus roles y permisos. Requiere JWT.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@ejemplo.com",
    "username": "admin",
    "firstName": "Juan",
    "lastName": "Pérez",
    "isActive": true,
    "isProtected": false,
    "roles": [
      {
        "id": "uuid",
        "name": "Admin",
        "weight": 90,
        "permissions": [{ "id": "uuid", "name": "users.read", "module": "users" }]
      }
    ],
    "lastLoginAt": "2026-04-11T...",
    "createdAt": "2026-01-01T..."
  }
}
```

---

### POST /auth/forgot-password

Solicita un código de recuperación de 6 dígitos por email. Siempre responde igual para no revelar si el email existe.

**Request:**

```json
{ "email": "user@example.com" }
```

**Response `200`:**

```json
{ "success": true, "data": { "message": "Si el email existe, recibirás un código en breve" } }
```

---

### POST /auth/verify-reset-code

Verifica el código recibido por email. Si es válido, devuelve un `resetToken` de un solo uso (válido 5 minutos).

**Request:**

```json
{
  "email": "user@example.com",
  "code": "847291"
}
```

**Response `200`:**

```json
{ "success": true, "data": { "resetToken": "uuid-de-un-solo-uso" } }
```

**Errores:**

| code               | Cuándo                                 |
| ------------------ | -------------------------------------- |
| `VALIDATION_ERROR` | Código incorrecto, expirado o ya usado |

---

### POST /auth/reset-password

Establece la nueva contraseña usando el `resetToken` del paso anterior. Revoca **todas** las sesiones activas del usuario.

**Request:**

```json
{
  "resetToken": "uuid-de-un-solo-uso",
  "newPassword": "nuevaContraseña123"
}
```

| Campo         | Validación          |
| ------------- | ------------------- |
| `resetToken`  | Requerido           |
| `newPassword` | Mínimo 8 caracteres |

**Response `200`:**

```json
{ "success": true, "data": { "message": "Contraseña actualizada correctamente" } }
```

**Errores:**

| code               | Cuándo                              |
| ------------------ | ----------------------------------- |
| `VALIDATION_ERROR` | Token inválido, expirado o ya usado |

---

## Flujo recomendado

### Al iniciar la app (con cookies)

Las cookies se manejan automáticamente — el browser las envía en cada request sin intervención del frontend.

1. Llamar `GET /auth/me` para verificar sesión activa
2. Si falla con 401: llamar `POST /auth/refresh` (sin body — usa la cookie)
3. Si también falla: redirigir a login

### Flujo de recuperación de contraseña

```
POST /auth/forgot-password  →  el usuario recibe email con código
POST /auth/verify-reset-code  →  validar código, guardar resetToken
POST /auth/reset-password  →  nueva contraseña con el resetToken
→ redirigir a login (todas las sesiones fueron cerradas)
```

### Interceptor recomendado (con cookies)

```typescript
// Si cualquier request devuelve 401, intentar refresh automáticamente
async function request(config) {
  try {
    return await fetch(config, { credentials: 'include' }); // ← credentials requerido para cookies
  } catch (err) {
    if (err.status === 401 && !config._retried) {
      const ok = await fetch('/auth/refresh', {
        method: 'POST',
        credentials: 'include', // ← el browser envía la cookie refresh_token automáticamente
      });
      if (ok) {
        config._retried = true;
        return fetch(config, { credentials: 'include' });
      }
      redirectToLogin();
    }
    throw err;
  }
}
```

> ⚠️ Siempre incluir `credentials: 'include'` en los requests para que el browser envíe las cookies HttpOnly.
