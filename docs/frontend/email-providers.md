# Email Providers — Guía para el frontend

Gestión de proveedores de email. Solo puede haber **un provider activo** a la vez.

---

## Endpoints

### GET /email-providers

Lista todos los providers ordenados por `isActive DESC, createdAt ASC`.

**Permiso:** `email-providers.read`

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "SMTP corporativo",
      "provider": "smtp",
      "from": "noreply@empresa.com",
      "config": {
        "host": "smtp.empresa.com",
        "port": 587,
        "user": "noreply@empresa.com",
        "secure": false
      },
      "isActive": true,
      "createdAt": "2026-01-01T...",
      "updatedAt": "2026-04-11T..."
    }
  ]
}
```

> ⚠️ `config` contiene credenciales — no mostrar passwords en UI.

---

### GET /email-providers/active

Obtiene el provider activo. Devuelve `null` si no hay ninguno activo.

**Permiso:** `email-providers.read`

---

### GET /email-providers/:id

Obtiene un provider por ID.

**Permiso:** `email-providers.read`

---

### POST /email-providers

Crea un nuevo provider. Se crea **inactivo** por defecto.

**Permiso:** `email-providers.create`

**Request — SMTP:**
```json
{
  "name": "SMTP corporativo",
  "provider": "smtp",
  "from": "noreply@empresa.com",
  "smtp": {
    "host": "smtp.empresa.com",
    "port": 587,
    "user": "noreply@empresa.com",
    "pass": "contraseña",
    "secure": false
  }
}
```

**Request — Resend:**
```json
{
  "name": "Resend producción",
  "provider": "resend",
  "from": "noreply@empresa.com",
  "resend": {
    "apiKey": "re_..."
  }
}
```

**Request — Google OAuth:**
```json
{
  "name": "Gmail OAuth",
  "provider": "google-oauth",
  "from": "noreply@gmail.com",
  "googleOAuth": {
    "clientId": "...",
    "clientSecret": "...",
    "refreshToken": "...",
    "user": "noreply@gmail.com"
  }
}
```

| Campo global | Requerido |
|--------------|-----------|
| `name` | ✓ |
| `provider` | ✓ — `smtp` \| `resend` \| `google-oauth` |
| `from` | ✗ — Overridea el remitente por defecto |

---

### PATCH /email-providers/:id

Actualiza configuración del provider.

**Permiso:** `email-providers.update`

**Request:** (todos opcionales)
```json
{
  "name": "SMTP nuevo nombre",
  "smtp": {
    "host": "nuevo-host.com",
    "port": 465,
    "secure": true
  }
}
```

> Si cambiás el `provider`, la config anterior queda inválida. Enviá la nueva config completa.

---

### POST /email-providers/:id/activate

Activa este provider y **desactiva automáticamente todos los demás**.

**Permiso:** `email-providers.update`

**Request:** body vacío

**Response `200`:** Provider activado.

---

### DELETE /email-providers/:id

Elimina un provider.

**Permiso:** `email-providers.delete`

**Errores:** `CONFLICT` si el provider está activo (activá otro primero).

---

## Flujo recomendado en UI

1. Listar providers (`GET /email-providers`)
2. Mostrar badge "Activo" en el provider con `isActive: true`
3. Botón "Activar" en los inactivos → `POST /email-providers/:id/activate`
4. Botón "Eliminar" deshabilitado si `isActive: true`
5. Al crear provider, mostrar formulario dinámico según `provider` seleccionado
