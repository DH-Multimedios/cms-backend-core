# Users — Guía para el frontend

Todos los endpoints requieren sesión activa. Los que modifican datos requieren permisos específicos.

---

## Endpoints

### GET /users

Lista paginada de usuarios. Excluye el usuario del sistema (`isSystemUser: true`).

**Permiso:** `users.read`

**Query params:**

| Param       | Tipo    | Descripción                                                       |
| ----------- | ------- | ----------------------------------------------------------------- |
| `page`      | number  | Default: 1                                                        |
| `limit`     | number  | Default: 20                                                       |
| `search`    | string  | Busca en email, username, firstName, lastName                     |
| `isActive`  | boolean | Filtrar por estado                                                |
| `roleId`    | UUID    | Filtrar por rol                                                   |
| `sortBy`    | string  | `createdAt` \| `email` \| `username` \| `firstName` \| `lastName` |
| `sortOrder` | string  | `ASC` \| `DESC`                                                   |

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "email": "usuario@ejemplo.com",
        "username": "usuario",
        "firstName": "Juan",
        "lastName": "Pérez",
        "isActive": true,
        "isSystemUser": false,
        "isProtected": false,
        "avatarUrl": "/uploads/media/uuid/avatars/2026-04-14/avatar.jpg",
        "roles": [{ "id": "uuid", "name": "admin", "label": "Admin", "weight": 90 }],
        "lastLoginAt": "2026-04-11T...",
        "createdAt": "2026-01-01T...",
        "updatedAt": "2026-04-11T...",
        "deletedAt": null
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### GET /users/:id

Obtiene un usuario por ID.

**Permiso:** `users.read`

**Response `200`:** Mismo shape que un item de la lista.

**Errores:** `USER_NOT_FOUND`

---

### POST /users

Crea un nuevo usuario.

**Permiso:** `users.create`

**Request:**

```json
{
  "email": "nuevo@ejemplo.com",
  "password": "contraseña123",
  "username": "nuevo",
  "firstName": "Ana",
  "lastName": "García",
  "roleIds": ["uuid-rol-admin"]
}
```

| Campo       | Requerido | Validación                           |
| ----------- | --------- | ------------------------------------ |
| `email`     | ✓         | Formato email, único                 |
| `password`  | ✓         | Mínimo 8 caracteres                  |
| `username`  | ✗         | 3-15 chars, solo alfanumérico, único |
| `firstName` | ✗         |                                      |
| `lastName`  | ✗         |                                      |
| `roleIds`   | ✗         | Array de UUIDs válidos               |

**Response `201`:** Usuario creado con roles asignados.

**Errores:** `USER_EMAIL_TAKEN`, `USERNAME_TAKEN`, `ROLE_NOT_FOUND`, `ROLE_WEIGHT_EXCEEDED`

> ⚠️ `ROLE_WEIGHT_EXCEEDED`: no podés asignar a un usuario un rol con más peso que el tuyo propio.

---

### PATCH /users/me

Actualiza el perfil del usuario autenticado. No requiere permisos especiales.

**Request:** (todos opcionales)

```json
{
  "email": "nuevo@email.com",
  "password": "nuevacontraseña",
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Response `200`:** Usuario actualizado.

**Errores:** `USER_EMAIL_TAKEN`

---

### POST /users/me/avatar

Sube o reemplaza el avatar del usuario autenticado. No requiere permisos especiales.

**Content-Type:** `multipart/form-data`

| Campo  | Tipo   | Requerido | Descripción                                                                    |
| ------ | ------ | --------- | ------------------------------------------------------------------------------ |
| `file` | File   | ✓         | Imagen (PNG, JPG, WEBP, etc. — los tipos permitidos se configuran en settings) |
| `alt`  | string | ✗         | Texto alternativo. Default: "Avatar de {firstName o email}"                    |

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "avatarUrl": "/uploads/media/{userId}/avatars/2026-04-14/{uuid}.jpg",
    "...": "..."
  }
}
```

> Al subir un avatar nuevo, se elimina automáticamente el avatar anterior (archivo físico y registro en Media).
> La imagen se valida contra las configuraciones de `media.allowedMimetypes` y `media.maxFileSize`.

---

### DELETE /users/me/avatar

Elimina el avatar del usuario autenticado. No requiere permisos especiales. Si no tiene avatar, no hace nada.

**Response `204`:** Sin contenido.

---

### DELETE /users/:id/avatar

Elimina el avatar de cualquier usuario. Requiere permiso `users.update`.

**Response `204`:** Sin contenido.

**Errores:** `USER_NOT_FOUND`

---

### POST /users/:id/avatar

Sube o reemplaza el avatar de cualquier usuario. Requiere permiso `users.update`.

**Content-Type:** `multipart/form-data`

| Campo  | Tipo   | Requerido | Descripción       |
| ------ | ------ | --------- | ----------------- |
| `file` | File   | ✓         | Imagen            |
| `alt`  | string | ✗         | Texto alternativo |

**Response `200`:** Mismo que `/users/me/avatar`.

**Errores:** `USER_NOT_FOUND`, `VALIDATION_ERROR`

---

### PATCH /users/:id

Actualiza un usuario. No puede cambiarse la jerarquía de roles propia.

**Permiso:** `users.update`

**Request:** (todos opcionales)

```json
{
  "email": "otro@email.com",
  "username": "otrousername",
  "password": "nuevapass",
  "firstName": "Nuevo",
  "lastName": "Nombre",
  "isActive": false,
  "roleIds": ["uuid-nuevo-rol"]
}
```

**Response `200`:** Usuario actualizado.

**Errores:** `USER_NOT_FOUND`, `USER_EMAIL_TAKEN`, `USERNAME_TAKEN`, `ROLE_WEIGHT_EXCEEDED`

---

### DELETE /users/:id

Elimina un usuario.

**Permiso:** `users.delete`

**Response `200`:**

```json
{ "statusCode": 200, "data": { "message": "Usuario eliminado correctamente" } }
```

**Errores:** `USER_NOT_FOUND`, `USER_PROTECTED`

> Los usuarios con `isProtected: true` no pueden eliminarse. Mostrar mensaje claro en UI.

---

## Campos a tener en cuenta

| Campo            | Descripción                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `isActive`       | Si `false`, el usuario no puede autenticarse. Mostrar badge de estado.                                                              |
| `isSystemUser`   | Si `true`, es el usuario del sistema y bypasea permisos. Útil para routing/UI especial.                                            |
| `isProtected`    | Si `true`, deshabilitar el botón de eliminar en UI.                                                                                 |
| `avatarUrl`      | URL del avatar del usuario. `null` si no tiene. Se gestiona via `/users/me/avatar` (subir/eliminar) o `/users/:id/avatar` (admin). |
| `roles[].label`  | Texto visible del rol para mostrar en UI.                                                                                           |
| `roles[].weight` | El peso del rol determina jerarquía. No permite asignar roles de mayor peso.                                                        |
| `lastLoginAt`    | Null si el usuario nunca se logueó.                                                                                                 |
| `deletedAt`      | Timestamp de cuándo fue dado de baja formalmente (`softDelete`). `null` si no fue dado de baja. Complementa `isActive`: un usuario puede estar inactivo (`isActive: false`) sin estar formalmente dado de baja (`deletedAt: null`). |

---

## Soft delete vs. isActive

Ambos campos coexisten con semánticas distintas:

| Estado                                   | `isActive` | `deletedAt`   |
| ---------------------------------------- | ---------- | ------------- |
| Activo                                   | `true`     | `null`        |
| Inactivo temporalmente                   | `false`    | `null`        |
| Dado de baja formalmente (soft delete)   | `false`    | timestamp     |

El backend usa `@DeleteDateColumn()` de TypeORM, que filtra automáticamente usuarios con `deletedAt IS NOT NULL` en todos los queries estándar. Para consultas que incluyan dados de baja, se usa `withDeleted()` internamente.
