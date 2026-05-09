# Roles & Permissions — Guía para el frontend

---

## Roles

### GET /roles

Lista paginada de roles con sus permisos.

**Permiso:** `roles.read`

**Query params:**

| Param       | Tipo   | Descripción       |
| ----------- | ------ | ----------------- |
| `page`      | number | Default: 1        |
| `limit`     | number | Default: 20       |
| `search`    | string | Busca en `name` o `label` |
| `sortBy`    | string | Default: `weight` |
| `sortOrder` | string | `ASC` \| `DESC`   |

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "admin",
        "label": "Admin",
        "description": "Administrador del sistema",
        "weight": 90,
        "isProtected": true,
        "permissions": [
          { "id": "uuid", "name": "users.read", "description": "Ver usuarios", "module": "users" }
        ],
        "createdAt": "2026-01-01T...",
        "updatedAt": "2026-04-11T..."
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

### GET /roles/list

Lista liviana de roles para selectores, checkboxes, etc. Sin paginación ni permisos incluidos.

**Permiso:** `roles.read`

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": [
    { "id": "uuid", "name": "super_admin", "label": "Super Admin", "weight": 100, "isProtected": true },
    { "id": "uuid", "name": "admin", "label": "Admin", "weight": 90, "isProtected": true },
    { "id": "uuid", "name": "user", "label": "Usuario", "weight": 50, "isProtected": false }
  ]
}
```

> Ordenado por `weight` DESC. Mostrar `label` en UI y usar `isProtected` para deshabilitar opciones protegidas.

---

### GET /roles/:id

Obtiene un rol por ID con sus permisos.

**Permiso:** `roles.read`

---

### POST /roles

Crea un nuevo rol.

**Permiso:** `roles.create`

**Request:**

```json
{
  "name": "content_editor",
  "label": "Editor de contenido",
  "description": "Puede editar contenido",
  "weight": 50
}
```

| Campo         | Requerido | Validación        |
| ------------- | --------- | ----------------- |
| `name`        | ✓         | Único, `snake_case` |
| `label`       | ✓         | Texto visible |
| `description` | ✗         |                   |
| `weight`      | ✗         | 0-100, default: 0 |

**Response `201`:** Rol creado.

**Errores:** `ROLE_NAME_TAKEN`

---

### PATCH /roles/:id

Actualiza un rol.

**Permiso:** `roles.update`

**Request:** (todos opcionales, mismos campos que POST)

> `name` es la clave técnica. `label` es el texto visible. La UI debería mostrar `label`.

**Errores:** `ROLE_NOT_FOUND`, `ROLE_PROTECTED`, `ROLE_NAME_TAKEN`

> `ROLE_PROTECTED`: si el rol tiene `isProtected: true`, deshabilitar edición en UI.

---

### DELETE /roles/:id

Elimina un rol.

**Permiso:** `roles.delete`

**Response `204`:** Sin contenido.

**Errores:** `ROLE_NOT_FOUND`, `ROLE_PROTECTED`

---

### PATCH /roles/:id/permissions

Agrega o remueve permisos de un rol de forma incremental. Ideal para switches/toggles individuales.

**Permiso:** `roles.update`

**Request:**

```json
{
  "add": ["uuid-perm-1"],
  "remove": ["uuid-perm-2"]
}
```

| Campo    | Requerido | Descripción               |
| -------- | --------- | ------------------------- |
| `add`    | ✗[]       | IDs de permisos a agregar |
| `remove` | ✗[]       | IDs de permisos a remover |

> Al menos uno de `add` o `remove` debe contener IDs.

**Response `200`:** Rol con los permisos actualizados.

**Errores:** `ROLE_NOT_FOUND`, `ROLE_PROTECTED`, `VALIDATION_ERROR`

**Ejemplos de uso:**

- Prender un permiso (switch ON): `{ "add": ["uuid-perm-1"] }`
- Apagar un permiso (switch OFF): `{ "remove": ["uuid-perm-1"] }`
- Toggle múltiple: `{ "add": ["uuid-perm-1"], "remove": ["uuid-perm-2", "uuid-perm-3"] }`

---

### POST /roles/:id/permissions

Asigna permisos a un rol. **Reemplaza** los permisos actuales (no acumula). Usar solo para bulk replace; para toggles individuales usar `PATCH`.

**Permiso:** `roles.update`

**Request:**

```json
{
  "permissionIds": ["uuid-perm-1", "uuid-perm-2"]
}
```

**Response `200`:** Rol con los nuevos permisos asignados.

> Para remover todos los permisos, enviar `permissionIds: []`.

---

## Permissions

### GET /permissions/list

Lista liviana de permisos para checkboxes agrupados por módulo. Sin paginación.

**Permiso:** `permissions.read`

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "name": "roles.create",
    "description": "Crear roles",
    "module": "roles",
    "moduleName": "Roles"
  },
  {
    "id": "uuid",
    "name": "roles.read",
    "description": "Ver roles",
    "module": "roles",
    "moduleName": "Roles"
  },
  {
    "id": "uuid",
    "name": "users.create",
    "description": "Crear usuarios",
    "module": "users",
    "moduleName": "Usuarios"
  },
  {
    "id": "uuid",
    "name": "users.read",
    "description": "Ver usuarios",
    "module": "users",
    "moduleName": "Usuarios"
  }
]
```

> Ordenado por `module` ASC, `name` ASC. Usar `moduleName` como label del grupo en la UI, `module` como key para el agrupado.

---

### GET /permissions

Lista todos los permisos del sistema, con paginación y filtros.

**Permiso:** `permissions.read`

**Query params:**

| Param    | Tipo   | Descripción        |
| -------- | ------ | ------------------ |
| `page`   | number |                    |
| `limit`  | number |                    |
| `search` | string | Busca en nombre    |
| `module` | string | Filtrar por módulo |

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      { "id": "uuid", "name": "users.read", "description": "Ver usuarios", "module": "users" },
      { "id": "uuid", "name": "users.create", "description": "Crear usuarios", "module": "users" }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

---

## Permisos del core

Los permisos se registran automáticamente al iniciar la app. Lista completa:

| Permiso                  | Módulo          | Descripción                             |
| ------------------------ | --------------- | --------------------------------------- |
| `users.read`             | users           | Ver usuarios                            |
| `users.create`           | users           | Crear usuarios                          |
| `users.update`           | users           | Editar usuarios                         |
| `users.delete`           | users           | Eliminar usuarios                       |
| `roles.read`             | roles           | Ver roles                               |
| `roles.create`           | roles           | Crear roles                             |
| `roles.update`           | roles           | Editar roles y asignar permisos         |
| `roles.delete`           | roles           | Eliminar roles                          |
| `permissions.read`       | permissions     | Ver permisos                            |
| `audit.read`             | audit           | Ver logs de auditoría                   |
| `settings.read`          | settings        | Ver settings y categorías               |
| `settings.update`        | settings        | Editar settings, categorías y reordenar |
| `settings.delete`        | settings        | Eliminar settings y categorías          |
| `taxonomies.read`        | taxonomies      | Ver taxonomías                          |
| `taxonomies.create`      | taxonomies      | Crear taxonomías                        |
| `taxonomies.update`      | taxonomies      | Editar y reordenar taxonomías           |
| `taxonomies.delete`      | taxonomies      | Eliminar taxonomías                     |
| `files.list`             | files           | Listar todos los archivos               |
| `files.read`             | files           | Ver detalle de archivo                  |
| `files.upload`           | files           | Subir archivos                          |
| `files.download`         | files           | Descargar archivos                      |
| `files.edit`             | files           | Editar metadata de archivos             |
| `files.delete`           | files           | Eliminar archivos                       |
| `media.list`             | media           | Listar imágenes                         |
| `media.read`             | media           | Ver detalle de imagen                   |
| `media.upload`           | media           | Subir imágenes                          |
| `media.edit`             | media           | Editar alt text                         |
| `media.delete`           | media           | Eliminar imágenes                       |
| `email-providers.read`   | email-providers | Ver providers de email                  |
| `email-providers.create` | email-providers | Crear providers                         |
| `email-providers.update` | email-providers | Editar y activar providers              |
| `email-providers.delete` | email-providers | Eliminar providers                      |
| `notifications.manage`   | notifications   | Gestionar templates, layouts y tipos    |

> Los proyectos cliente pueden registrar permisos propios — aparecerán aquí automáticamente.

---

## El campo `weight`

El `weight` (0-100) define jerarquía visual y establece un límite al asignar roles:

- **SuperAdmin**: weight = 100
- **Admin**: weight = 90
- **User**: weight = 50 (usuario estándar del core)
- **Editor**: weight = 50 (ejemplo de rol custom)
- **Viewer**: weight = 10 (ejemplo de rol custom)

**Regla:** Un usuario no puede asignar a otro un rol con mayor `weight` que el suyo propio.

> El peso NO bypasea permisos — solo sirve para ordenamiento y validación de jerarquía.
