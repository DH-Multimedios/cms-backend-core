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

| code | Cuándo |
|------|--------|
| `INVALID_CREDENTIALS` | Email/username no existe o contraseña incorrecta |
| `FORBIDDEN` | Usuario inactivo |

---

### POST /auth/refresh

Renueva el access token usando el refresh token. Implementa **token rotation**: el refresh token usado se revoca y se genera uno nuevo.

**Request:**
```json
{ "refreshToken": "eyJhbGci..." }
```

**Response `200`:**
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

| code | Cuándo |
|------|--------|
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
        "permissions": [
          { "id": "uuid", "name": "users.read", "module": "users" }
        ]
      }
    ],
    "lastLoginAt": "2026-04-11T...",
    "createdAt": "2026-01-01T..."
  }
}
```

---

## Flujo recomendado

### Al iniciar la app

1. Leer `accessToken` y `refreshToken` de localStorage
2. Si hay `accessToken`: llamar `GET /auth/me` para verificar sesión activa
3. Si falla con 401: intentar `POST /auth/refresh`
4. Si también falla: redirigir a login

### Interceptor de axios/fetch recomendado

```typescript
// Si cualquier request devuelve 401, intentar refresh automáticamente
async function request(config) {
  try {
    return await fetch(config);
  } catch (err) {
    if (err.status === 401 && !config._retried) {
      const tokens = await refreshTokens();
      if (tokens) {
        config._retried = true;
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return fetch(config);
      }
      redirectToLogin();
    }
    throw err;
  }
}
```
