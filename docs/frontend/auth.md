# Auth — Guía para el frontend

---

## Modelo de autenticación

El sistema usa **sesiones server-side** con identificador UUID opaco.

- **Web / browser**: la sesión viaja automáticamente en cookie HttpOnly `session_id`. El frontend no toca el token.
- **Flutter / mobile**: el `sessionId` viene en el body del login. Guardarlo en SecureStorage y enviarlo en el header `X-Session-Id` en cada request autenticado.

No existe refresh token ni access token JWT. La sesión dura **1 año** (configurable). La revocación es inmediata.

---

## Endpoints

### POST /auth/login

Autentica un usuario y crea una nueva sesión.

**Request:**

```json
{
  "login": "admin@ejemplo.com",
  "password": "micontraseña"
}
```

> `login` acepta **email** o **username**.

**Response `200`:**

El servidor setea automáticamente la cookie HttpOnly `session_id` (web). El body incluye el `sessionId` para Flutter.

```json
{
  "statusCode": 200,
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
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
      "roles": [{ "id": "uuid", "name": "admin", "label": "Admin", "weight": 90 }],
      "lastLoginAt": "2026-04-11T...",
      "createdAt": "2026-01-01T...",
      "updatedAt": "2026-04-11T..."
    }
  }
}
```

**Web:** ignorar el `sessionId` del body. La cookie se maneja sola.

**Flutter:** guardar `data.sessionId` en SecureStorage y enviarlo como header `X-Session-Id` en todos los requests autenticados.

**Errores:**

| code                  | Cuándo                                           |
| --------------------- | ------------------------------------------------ |
| `INVALID_CREDENTIALS` | Email/username no existe o contraseña incorrecta |
| `FORBIDDEN`           | Usuario inactivo                                 |

---

### POST /auth/logout

Revoca la sesión actual. Requiere sesión activa.

**Request:** body vacío.

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": { "message": "Sesión cerrada correctamente" }
}
```

Web: limpia la cookie automáticamente.
Flutter: eliminar el `sessionId` del SecureStorage.

---

### POST /auth/logout-all

Revoca **todas** las sesiones activas del usuario (todos los dispositivos). Requiere sesión activa.

**Request:** body vacío.

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": { "message": "Todas las sesiones fueron cerradas" }
}
```

---

### GET /auth/me

Devuelve el usuario autenticado con sus roles. Requiere sesión activa.

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
    "roles": [{ "id": "uuid", "name": "admin", "label": "Admin", "weight": 90 }],
    "lastLoginAt": "2026-04-11T...",
    "createdAt": "2026-01-01T...",
    "updatedAt": "2026-04-11T..."
  }
}
```

> `roles` incluye `id`, `name`, `label` y `weight` pero **no** incluye permisos. Mostrar `label` en UI. Para permisos, usar `GET /auth/me/permissions`.

---

### GET /auth/me/permissions

Devuelve los permisos efectivos del usuario autenticado. Requiere sesión activa.

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

- `permissions`: flat array deduplicado — listo para `permissions.includes('users.read')`.
- `isSystemUser`: si es `true`, bypassa todos los permisos.
- `maxWeight`: peso máximo entre los roles del usuario. Útil para determinar nivel de UI.

---

### POST /auth/forgot-password

Solicita un código de recuperación de 6 dígitos por email. Siempre responde igual para no revelar si el email existe.

**Request:**

```json
{ "email": "user@example.com" }
```

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

---

## Configuración (proyecto consumidor)

La duración de sesión se configura desde el panel de administración en
**Settings → Autenticación → Duración de sesión (días)**. El default es `365`.

Las únicas opciones de la config del proyecto son las de cookie:

```typescript
auth: {
  cookiePath: '/',            // path de la cookie session_id
  // cookieSecure y cookieSameSite tienen defaults inteligentes:
  //   - dev: sameSite='none', secure=true  (cross-origin requiere sameSite=none)
  //   - prod: sameSite='lax', secure=true
},
```

**¿Por qué `sameSite: 'none'` en desarrollo?**

Si el frontend (`localhost:3000`) y el backend (`localhost:5010`) están en puertos distintos, son orígenes distintos. Con `sameSite: 'lax'`, el browser NO envía cookies en requests cross-origin. Necesitás `sameSite: 'none'`.

> `sameSite: 'none'` **requiere** `secure: true`. Chrome trata `localhost` como contexto seguro, así que funciona sin HTTPS en desarrollo.

---

## Flujo recomendado — Web

### Al iniciar la app

Las cookies se manejan automáticamente — el browser las envía en cada request.

1. Llamar `GET /auth/me` para verificar sesión activa
2. Si falla con `401`: redirigir a login (no hay refresh, la sesión expiró o fue revocada)

### Interceptor recomendado

```typescript
async function request(config) {
  const res = await fetch(config, { credentials: 'include' });
  if (res.status === 401) {
    redirectToLogin();
    return;
  }
  return res;
}
```

> Siempre incluir `credentials: 'include'` (fetch) o `withCredentials: true` (Axios) para que el browser envíe la cookie HttpOnly.

---

## Flujo recomendado — Flutter

### Login

```dart
final res = await http.post('/auth/login', body: { 'login': email, 'password': password });
final sessionId = res.body['data']['sessionId'];
await secureStorage.write(key: 'session_id', value: sessionId);
```

### Cada request autenticado

```dart
final sessionId = await secureStorage.read(key: 'session_id');
final res = await http.get(
  '/auth/me',
  headers: { 'X-Session-Id': sessionId },
);
```

### Logout

```dart
await http.post('/auth/logout', headers: { 'X-Session-Id': sessionId });
await secureStorage.delete(key: 'session_id');
```

### Manejo de sesión expirada

```dart
if (res.statusCode == 401) {
  await secureStorage.delete(key: 'session_id');
  navigateToLogin();
}
```

---

## Flujo de recuperación de contraseña

```
POST /auth/forgot-password  →  el usuario recibe email con código
POST /auth/verify-reset-code  →  validar código, obtener resetToken
POST /auth/reset-password  →  nueva contraseña con el resetToken
→ redirigir a login (todas las sesiones fueron cerradas)
```
