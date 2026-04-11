# Audit — Guía para el frontend

El módulo de auditoría registra automáticamente todas las acciones importantes del sistema. Solo lectura desde el frontend.

---

## Endpoints

### GET /audit

Lista paginada de logs de auditoría.

**Permiso:** `audit.read`

**Query params:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |
| `sortBy` | string | Default: `createdAt` |
| `sortOrder` | string | `ASC` \| `DESC` (default: `DESC`) |
| `userId` | UUID | Filtrar por usuario |
| `entity` | string | Filtrar por entidad (ej: `User`, `Role`, `Setting`) |
| `action` | string | Filtrar por acción (ej: `create`, `update`, `delete`, `login`) |
| `from` | ISO Date | Fecha de inicio del rango |
| `to` | ISO Date | Fecha de fin del rango |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "userId": "uuid",
        "user": {
          "id": "uuid",
          "firstName": "Juan",
          "lastName": "Pérez"
        },
        "action": "update",
        "entity": "User",
        "entityId": "uuid-del-usuario-modificado",
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2026-04-11T15:30:00.000Z"
      }
    ],
    "total": 250,
    "page": 1,
    "limit": 20,
    "pages": 13
  }
}
```

---

### GET /audit/:id

Obtiene un log completo con metadata de before/after.

**Permiso:** `audit.read`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "user": { "id": "uuid", "firstName": "Juan", "lastName": "Pérez" },
    "action": "update",
    "entity": "User",
    "entityId": "uuid",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "metadata": {
      "before": { "email": "viejo@email.com" },
      "after": { "email": "nuevo@email.com" }
    },
    "createdAt": "2026-04-11T15:30:00.000Z"
  }
}
```

---

## Acciones registradas

| Acción | Entidades |
|--------|-----------|
| `login` | auth |
| `create` | User, Role, Setting, SettingCategory, EmailProvider, EmailTemplate, EmailLayout, NotificationType |
| `update` | User, Role, Setting, SettingCategory, EmailProvider, EmailTemplate |
| `delete` | User, Role, Setting, SettingCategory, EmailProvider |
| `activate` | EmailProvider |
| `refresh_failed` | auth |
| `logout` | auth |
| `reorder` | SettingCategory |

---

## Consideraciones de UI

- `userId` puede ser `null` en acciones del sistema (seeder, scripts)
- `metadata` solo está en el detalle (`GET /audit/:id`), no en el listado
- Las contraseñas en `metadata` siempre aparecen como `[hidden]` o `[changed]`
- El campo `userAgent` puede ser largo — mostrar truncado
