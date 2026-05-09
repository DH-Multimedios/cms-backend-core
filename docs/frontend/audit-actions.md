# Audit Actions — Glosario

Referencia de todas las acciones registradas en el sistema de auditoría (`GET /audit`).

## Estructura de un log

| Campo    | Tipo   | Descripción                          |
|----------|--------|--------------------------------------|
| `action` | string | Identificador de la acción (ver abajo) |
| `entity` | string | Entidad afectada (ver sección Entidades) |
| `userId` | uuid   | Usuario que ejecutó la acción        |

---

## Acciones por entidad

### User

| `action`         | Descripción en español              |
|------------------|-------------------------------------|
| `login`          | Inicio de sesión                    |
| `logout`         | Cierre de sesión                    |
| `logout_all`     | Cierre de todas las sesiones        |
| `create`         | Usuario creado                      |
| `update`         | Usuario actualizado                 |
| `delete`         | Usuario eliminado                   |
| `update_profile` | Perfil propio actualizado           |
| `update_avatar`  | Avatar actualizado                  |
| `remove_avatar`  | Avatar eliminado                    |

### Role

| `action`              | Descripción en español              |
|-----------------------|-------------------------------------|
| `create`              | Rol creado                          |
| `update`              | Rol actualizado                     |
| `delete`              | Rol eliminado                       |
| `assign_permissions`  | Permisos asignados al rol           |
| `update_permissions`  | Permisos del rol actualizados       |

### Media

| `action`  | Descripción en español  |
|-----------|------------------------|
| `upload`  | Archivo subido         |
| `edit`    | Archivo editado        |
| `delete`  | Archivo eliminado      |

### File

| `action`   | Descripción en español  |
|------------|------------------------|
| `upload`   | Archivo subido         |
| `download` | Archivo descargado     |
| `update`   | Archivo actualizado    |
| `delete`   | Archivo eliminado      |

### Taxonomy

| `action`  | Descripción en español    |
|-----------|--------------------------|
| `create`  | Taxonomía creada         |
| `update`  | Taxonomía actualizada    |
| `delete`  | Taxonomía eliminada      |

### Setting

| `action`  | Descripción en español        |
|-----------|------------------------------|
| `create`  | Configuración creada         |
| `update`  | Configuración actualizada    |
| `delete`  | Configuración eliminada      |

### EmailProvider

| `action`   | Descripción en español              |
|------------|-------------------------------------|
| `create`   | Proveedor de email creado           |
| `update`   | Proveedor de email actualizado      |
| `activate` | Proveedor de email activado         |
| `delete`   | Proveedor de email eliminado        |

---

## Nota

El campo `action` llega tal cual en la API. La traducción al español es responsabilidad del frontend.
