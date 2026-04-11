# Módulo de Notificaciones — Guía para el frontend

Este módulo permite gestionar templates de email por bloques, configurar layouts reutilizables y administrar preferencias de notificación por usuario.

---

## Conceptos clave

| Concepto | Descripción |
|----------|-------------|
| `EmailLayout` | Header o footer reutilizable. Compuesto por secciones con columnas y bloques. |
| `EmailTemplate` | Plantilla de email para un tipo de notificación específico. Referencia un header y un footer del gallery. |
| `NotificationType` | Registro de todos los tipos de notificación disponibles (extensible). |
| `UserNotificationPreference` | Preferencia del usuario para activar/desactivar tipos configurables. |

---

## Endpoints disponibles

### Tipos de notificación

```
GET  /notification-types          → lista pública (usar para panel de preferencias)
GET  /notification-types/:id      → detalle (requiere notifications.manage)
POST /notification-types          → crear tipo nuevo (requiere notifications.manage)
PATCH /notification-types/:id     → actualizar / toggle isEnabled (requiere notifications.manage)
DELETE /notification-types/:id    → eliminar (requiere notifications.manage)
```

**Respuesta típica:**
```json
[
  {
    "id": 1,
    "key": "user.welcome",
    "entityType": "user",
    "notificationType": "welcome",
    "name": "Email de bienvenida",
    "description": "Se envía al crear un usuario nuevo",
    "userConfigurable": false,
    "defaultEnabled": true,
    "isEnabled": true
  }
]
```

> `userConfigurable: true` → mostrar en el panel de preferencias del perfil del usuario.

---

### Layouts (galería de headers/footers)

```
GET    /email-layouts             → todos los layouts
GET    /email-layouts?type=header → solo headers
GET    /email-layouts?type=footer → solo footers
GET    /email-layouts/:id         → detalle
POST   /email-layouts             → crear layout
PATCH  /email-layouts/:id         → actualizar layout
DELETE /email-layouts/:id         → eliminar layout
```

> ⚠️ Actualizar un layout NO recompila automáticamente los templates que lo usan. Después de actualizar un layout, hacer `PATCH /email-templates/:id` en los templates afectados para forzar la recompilación.

---

### Templates de email

```
GET    /email-templates           → listar todos
GET    /email-templates/:id       → detalle (incluye relaciones header y footer)
POST   /email-templates           → crear template
PATCH  /email-templates/:id       → actualizar + recompilar HTML automáticamente
DELETE /email-templates/:id       → eliminar (no aplica a templates isDefault)
```

> `compiledHtml` se regenera automáticamente en cada `POST` y `PATCH`. El frontend no necesita compilar nada.

---

### Preferencias del usuario autenticado

```
GET /notification-preferences/me   → mis preferencias
PUT /notification-preferences/me   → crear o actualizar una preferencia
```

**Body para PUT:**
```json
{
  "notificationTypeKey": "user.email-verification",
  "enabled": false
}
```

---

## Schema de bloques

Los templates y layouts están compuestos por **secciones → columnas → bloques**.

### Estructura base

```typescript
Section {
  type: 'section'
  columns: Column[]
  backgroundColor?: string    // '#ffffff'
  padding?: string            // '20px' | '20px 40px'
}

Column {
  blocks: Block[]
  width?: string              // '100%' | '50%' | '33%'
  padding?: string
  verticalAlign?: 'top' | 'middle' | 'bottom'
}
```

### Tipos de bloque

#### `text`
```json
{
  "type": "text",
  "content": "Hola <strong>{{firstName}}</strong>",
  "color": "#444444",
  "fontSize": "16px",
  "align": "left",
  "padding": "10px 0"
}
```

#### `heading`
```json
{
  "type": "heading",
  "content": "Bienvenido, {{firstName}}",
  "level": 1,
  "color": "#1a1a2e",
  "align": "left"
}
```
> `level`: 1 → 32px, 2 → 24px, 3 → 18px

#### `button`
```json
{
  "type": "button",
  "label": "Verificar mi email",
  "url": "{{verificationUrl}}",
  "align": "center",
  "backgroundColor": "#1a1a2e",
  "color": "#ffffff",
  "borderRadius": "4px"
}
```

#### `image`
```json
{
  "type": "image",
  "src": "{{appLogoUrl}}",
  "alt": "Logo",
  "width": "140px",
  "align": "left",
  "link": "{{appUrl}}"
}
```

#### `divider`
```json
{
  "type": "divider",
  "borderColor": "#eeeeee",
  "borderWidth": "1px",
  "padding": "10px 0"
}
```

#### `spacer`
```json
{
  "type": "spacer",
  "height": 20
}
```

---

## Variables disponibles

Las variables se reemplazan al momento del envío usando la sintaxis Handlebars: `{{nombreVariable}}`.

Cada template documenta sus variables en el campo `variables[]`.

**Variables globales** (disponibles en todos los templates):
| Variable | Descripción |
|----------|-------------|
| `{{appName}}` | Nombre de la aplicación (de settings `app.name`) |
| `{{appUrl}}` | URL del frontend (de settings `app.url`) |
| `{{appLogoUrl}}` | URL del logo (de settings) |
| `{{currentYear}}` | Año actual |

**Variables de templates de usuario:**
| Variable | Template |
|----------|----------|
| `{{firstName}}` | Todos los templates de user |
| `{{verificationUrl}}` | welcome, email-verification |
| `{{verificationToken}}` | welcome, email-verification |
| `{{resetUrl}}` | password-reset |
| `{{resetToken}}` | password-reset |

---

## Flujo del editor de templates

### 1. Cargar datos iniciales
```
GET /email-layouts?type=header  → para el picker de headers
GET /email-layouts?type=footer  → para el picker de footers
GET /notification-types         → para el selector de tipo
```

### 2. Construir el template

El usuario elige:
- Tipo de notificación (`entityType` + `notificationType`)
- Header del gallery
- Footer del gallery
- Body: secciones con columnas y bloques (drag & drop)

### 3. Guardar

```
PATCH /email-templates/:id
{
  "headerId": 1,
  "footerId": 2,
  "subject": "Bienvenido a {{appName}}, {{firstName}}",
  "bodySections": [
    {
      "type": "section",
      "backgroundColor": "#ffffff",
      "padding": "40px",
      "columns": [
        {
          "width": "100%",
          "blocks": [
            { "type": "heading", "level": 1, "content": "Hola {{firstName}}" },
            { "type": "button", "label": "Ver plataforma", "url": "{{appUrl}}" }
          ]
        }
      ]
    }
  ],
  "variables": ["firstName", "appName", "appUrl"]
}
```

El `compiledHtml` se regenera automáticamente. La respuesta incluye el HTML compilado listo para preview.

### 4. Preview

Usar `compiledHtml` de la respuesta para mostrar un preview con un iframe.

---

## Panel de preferencias del usuario

Mostrar solo los tipos con `userConfigurable: true`:

```
GET /notification-types → filtrar por userConfigurable: true
GET /notification-preferences/me → obtener estado actual
```

Para cada tipo, mostrar un toggle. Al cambiar:

```
PUT /notification-preferences/me
{ "notificationTypeKey": "user.email-verification", "enabled": false }
```

Si un tipo no tiene preferencia guardada, el estado por defecto es `defaultEnabled`.
