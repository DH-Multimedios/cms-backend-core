# Users — Guía para el frontend

Todos los endpoints requieren JWT. Los que modifican datos requieren permisos específicos.

---

## Endpoints

### GET /users

Lista paginada de usuarios. Excluye el usuario del sistema (`isSystemUser: true`).

**Permiso:** `users.read`

**Query params:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |
| `search` | string | Busca en email, username, firstName, lastName |
| `isActive` | boolean | Filtrar por estado |
| `roleId` | UUID | Filtrar por rol |
| `sortBy` | string | `createdAt` \| `email` \| `username` \| `firstName` \| `lastName` |
| `sortOrder` | string | `ASC` \| `DESC` |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "email": "usuario@ejemplo.com",
        "username": "usuario",
        "firstName": "Juan",
        "lastName": "Pérez",
        "isActive": true,
        "isProtected": false,
        "roles": [{ "id": "uuid", "name": "Admin", "weight": 90 }],
        "lastLoginAt": "2026-04-11T...",
        "createdAt": "2026-01-01T...",
        "updatedAt": "2026-04-11T..."
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

| Campo | Requerido | Validación |
|-------|-----------|------------|
| `email` | ✓ | Formato email, único |
| `password` | ✓ | Mínimo 8 caracteres |
| `username` | ✗ | 3-15 chars, solo alfanumérico, único |
| `firstName` | ✗ | |
| `lastName` | ✗ | |
| `roleIds` | ✗ | Array de UUIDs válidos |

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
{ "success": true, "data": { "message": "Usuario eliminado correctamente" } }
```

**Errores:** `USER_NOT_FOUND`, `USER_PROTECTED`

> Los usuarios con `isProtected: true` no pueden eliminarse. Mostrar mensaje claro en UI.

---

## Campos a tener en cuenta

| Campo | Descripción |
|-------|-------------|
| `isActive` | Si `false`, el usuario no puede autenticarse. Mostrar badge de estado. |
| `isProtected` | Si `true`, deshabilitar el botón de eliminar en UI. |
| `roles[].weight` | El peso del rol determina jerarquía. No permite asignar roles de mayor peso. |
| `lastLoginAt` | Null si el usuario nunca se logueó. |
