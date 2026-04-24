# Auth — Guía para el frontend

---

## Endpoints

### POST /auth/login

Autentica un usuario y devuelve tokens JWT.

Soporta dos flujos:

- **Web / browser**: usar cookies HttpOnly
- **Mobile / clientes no-browser**: usar `accessToken` y `refreshToken` del body

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
- `refresh_token` — expira en 7 días y usa `Path=/auth`

> En web no hace falta guardar los tokens del body: el navegador enviará las cookies automáticamente.
> Los tokens en el body existen para mobile e integraciones no-browser.

```json
{
  "statusCode": 200,
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
      "isSystemUser": false,
      "isProtected": false,
      "avatarUrl": "/uploads/media/uuid/avatars/2026-04-14/avatar.jpg",
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

**Request (con body):**

```json
{ "refreshToken": "eyJhbGci..." }
```

**Request (con cookies):**

```json
{}
```

> Si usás cookies HttpOnly, no necesitás enviar el token en el body. El servidor lo lee de la cookie `refresh_token` automáticamente. Si no hay token ni en el body ni en la cookie, devuelve `401`.

**Response `200`:** Nuevos tokens en body + renueva las cookies automáticamente.

```json
{
  "statusCode": 200,
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

> ⚠️ Cada refresh token es de **un solo uso**. En mobile/integraciones guardá el nuevo token que devuelve la respuesta. En web, las cookies se renuevan automáticamente.

---

### POST /auth/logout

Revoca el refresh token actual. Requiere JWT.

**Request (con body):**

```json
{ "refreshToken": "eyJhbGci..." }
```

**Request (con cookies):** body vacío — el servidor lee el token de la cookie automáticamente.

**Response `200`:**

```json
{
  "statusCode": 200,
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
  "statusCode": 200,
  "data": { "message": "Todas las sesiones fueron cerradas" }
}
```

---

### GET /auth/me

Devuelve el usuario autenticado con sus roles. Requiere JWT.

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "email": "admin@ejemplo.com",
    "username": "admin",
    "firstName": "Juan",
    "lastName": "Pérez",
    "isActive": true,
    "isSystemUser": false,
    "isProtected": false,
    "avatarUrl": "/uploads/media/uuid/avatars/2026-04-14/avatar.jpg",
    "roles": [{ "id": "uuid", "name": "Admin", "weight": 90 }],
    "lastLoginAt": "2026-04-11T...",
    "createdAt": "2026-01-01T...",
    "updatedAt": "2026-04-11T..."
  }
}
```

> `roles` incluye `id`, `name` y `weight` pero **no** incluye permisos. `isSystemUser` indica si el usuario es el usuario del sistema. Para permisos, usar `GET /auth/me/permissions`.

---

### GET /auth/me/permissions

Devuelve los permisos efectivos del usuario autenticado. Requiere JWT.

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "isSystemUser": false,
    "maxWeight": 90,
    "permissions": ["users.read", "users.create", "roles.read", "media.upload"]
  }
}
```

- `permissions`: flat array deduplicado de nombres de permisos — listo para `permissions.includes('users.read')`.
- `isSystemUser`: si es `true`, el usuario bypassa todos los permisos (no hace falta chequear el array).
- `maxWeight`: el peso más alto entre los roles del usuario. Si `isSystemUser` es `true`, siempre es `100`. Útil para determinar qué nivel de UI mostrar (ej: acceso a panels restringidos).

````

---

### POST /auth/forgot-password

Solicita un código de recuperación de 6 dígitos por email. Siempre responde igual para no revelar si el email existe.

**Request:**

```json
{ "email": "user@example.com" }
````

**Response `200`:**

```json
{ "statusCode": 200, "data": { "message": "Si el email existe, recibirás un código en breve" } }
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
{ "statusCode": 200, "data": { "resetToken": "uuid-de-un-solo-uso" } }
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
{ "statusCode": 200, "data": { "message": "Contraseña actualizada correctamente" } }
```

**Errores:**

| code               | Cuándo                              |
| ------------------ | ----------------------------------- |
| `VALIDATION_ERROR` | Token inválido, expirado o ya usado |

---

## Configuración de cookies (para el proyecto consumidor)

El backend setea cookies HttpOnly automáticamente, pero hay que configurarlas correctamente según el entorno. En el `AuthConfig` del proyecto consumidor:

```typescript
auth: {
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiration: '15m',
  jwtRefreshExpiration: '7d',
  cookiePath: '/api/auth',  // ⚠️ debe incluir el API prefix
  // cookieSecure y cookieSameSite tienen defaults inteligentes:
  //   - dev: sameSite='none', secure=true  (cross-origin requiere sameSite=none)
  //   - prod: sameSite='lax', secure=true   (mismo origin o behind proxy)
  // Solo sobreescribí estos si tenés un caso particular
},
```

**¿Por qué `sameSite: 'none'` en desarrollo?**

Si el frontend (`localhost:3000`) y el backend (`localhost:5010`) están en puertos distintos, son **orígenes distintos**. Con `sameSite: 'lax'`, el browser NO envía cookies en requests cross-origin tipo POST/fetch. Necesitás `sameSite: 'none'`.

> ⚠️ `sameSite: 'none'` **requiere** `secure: true`. Chrome rechaza cookies con `SameSite=None` sin `Secure`. Pero Chrome trata `localhost` como contexto seguro, así que funciona sin HTTPS en desarrollo.

**`cookiePath` es crucial:**

Debe cubrir todos los endpoints de auth: `refresh`, `logout` y `logout-all`. Usá el path del módulo auth con el API prefix, por ejemplo `/api/auth`. Si usás solo `/api/auth/refresh`, la cookie no se envía a `/api/auth/logout` y el botón de cerrar sesión no funciona.

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

### ⚠️ Importante: `credentials: 'include'`

Si usás cookies HttpOnly para auth, **todos** los requests al backend DEBEN incluir `credentials: 'include'` (fetch) o `withCredentials: true` (Axios). Sin esto, el browser no envía ni recibe cookies, y el refresh token será siempre `undefined`.

```typescript
// fetch
fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });

// axios
axios.post('/api/auth/refresh', {}, { withCredentials: true });
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
