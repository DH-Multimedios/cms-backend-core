# Settings Builder — Guía para el frontend

El módulo de settings permite al admin crear configuraciones dinámicas con tipos de input específicos y metadata extra (opciones para selects, rango para números, etc.).

---

## Endpoint clave: tipos de input

```
GET /settings/input-types   → público, sin auth
```

Devuelve el schema completo de cada tipo soportado. Usar para construir el formulario de creación/edición de settings dinámicamente.

**Respuesta:**

```json
[
  {
    "value": "text",
    "label": "Texto corto",
    "compatibleTypes": ["string"],
    "meta": null
  },
  {
    "value": "textarea",
    "label": "Texto largo",
    "compatibleTypes": ["string"],
    "meta": {
      "rows": { "type": "number", "required": false, "description": "Número de filas visibles" }
    }
  },
  {
    "value": "select",
    "label": "Select",
    "compatibleTypes": ["string"],
    "meta": {
      "options": {
        "type": "array",
        "required": true,
        "description": "Opciones disponibles",
        "itemSchema": { "value": "string", "label": "string" }
      }
    }
  }
]
```

---

## Lógica del builder

### 1. Cargar tipos disponibles

```
GET /settings/input-types
```

### 2. Mostrar selector de inputType

Usar el array como fuente para un `<select>`. Mostrar `label`, enviar `value`.

### 3. Renderizar campos de meta dinámicamente

Cuando el usuario elige un `inputType`:

- Si `meta === null` → no mostrar campos extra
- Si `meta !== null` → iterar las keys de `meta` y renderizar el campo correspondiente:

```typescript
Object.entries(inputType.meta).forEach(([fieldName, schema]) => {
  if (schema.type === 'number')  → renderizar <input type="number">
  if (schema.type === 'string')  → renderizar <input type="text">
  if (schema.type === 'array')   → renderizar lista dinámica de items (ver abajo)
  if (schema.required)           → marcar como requerido
})
```

### 4. Campos de tipo `array` (options para select/radio/checkbox)

El `itemSchema` describe la forma de cada item. Para `select`, `radio` y `checkbox`:

```json
"itemSchema": { "value": "string", "label": "string" }
```

Renderizar como una lista editable de pares `value` / `label` con botón para agregar/eliminar.

---

## Tipos de input y su relación con `type` de dato

Usar `compatibleTypes` para filtrar qué `type` (dato de DB) se puede combinar con cada `inputType`:

| inputType | compatibleTypes  |
| --------- | ---------------- |
| text      | string           |
| textarea  | string           |
| number    | number           |
| password  | string, password |
| toggle    | boolean          |
| checkbox  | boolean, json    |
| radio     | string           |
| select    | string           |
| color     | string           |
| url       | string           |
| email     | string           |
| date      | string           |
| image     | string           |

> Si el usuario no elige `type`, inferirlo automáticamente desde `compatibleTypes[0]`.

---

## Tipo `image` — comportamiento especial

A diferencia de otros tipos, `image` no guarda una URL sino el **UUID del media** en `value`.

Al leer el setting, el backend resuelve automáticamente la imagen e inyecta en `meta`:

```json
{
  "key": "app.logo",
  "value": "550e8400-e29b-41d4-a716-446655440000",
  "inputType": "image",
  "meta": {
    "url": "/uploads/logo.png",
    "alt": "Logo del sitio"
  }
}
```

**En el frontend:**
- Mostrar el picker del módulo de media al editar (subir con `usage: "setting"`)
- Para renderizar: usar `meta.url` directamente — no resolver el UUID manualmente
- Si `meta.url` es `null` → la imagen fue borrada, mostrar placeholder

---

## Validación de valores

El backend valida automáticamente ciertos tipos al guardar/actualizar:

| inputType | Validación |
|-----------|------------|
| `url`     | Formato URL válido (protocolo + dominio) |
| `email`   | Formato email válido (regex básico) |
| otros     | Sin validación de formato |

**Comportamiento:**
- Valores vacíos (`""`) están permitidos — no se validan
- Si el valor no cumple el formato, el backend retorna `400 VALIDATION_ERROR`
- La validación usa el `inputType` del setting — si se cambia el tipo en la misma request, valida contra el nuevo

**Ejemplo de error:**
```json
PATCH /settings/:id
{ "value": "no-es-url" }

→ 400 Bad Request
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "El valor no es una URL válida"
}
```

---

## Tipo `checkbox` — dos modos

`checkbox` tiene dos usos distintos según el `type` del setting:

### Modo 1: Checkbox único (type: `boolean`)

Sin opciones. Representa on/off, true/false.

```json
{
  "key": "app.maintenanceMode",
  "inputType": "checkbox",
  "type": "boolean",
  "value": "false"
}
```

**En el frontend:** renderizar un checkbox único. El `value` es `"true"` o `"false"` (string).

---

### Modo 2: Checkbox múltiple (type: `json`)

Con `meta.options`. Permite selección múltiple de una lista predefinida.

```json
{
  "key": "files.allowedMimetypes",
  "inputType": "checkbox",
  "type": "json",
  "value": "[\"application/pdf\",\"text/csv\"]",
  "meta": {
    "options": [
      { "value": "application/pdf", "label": "PDF" },
      { "value": "text/csv", "label": "CSV" },
      { "value": "application/msword", "label": "Word (.doc)" }
    ]
  }
}
```

**En el frontend:**
- Renderizar un checkbox por cada opción en `meta.options`
- El `value` es un JSON stringificado con el array de valores seleccionados
- Parsear `value` para saber qué checkboxes marcar: `JSON.parse(value)`
- Al guardar, stringify el array de valores: `JSON.stringify(selectedValues)`
- **Valor inicial recomendado:** `"[]"` (array vacío), no `"false"`

**Al crear un nuevo setting con checkbox múltiple:**
- Definir `type: "json"`
- Definir `meta.options` en el POST (igual que en `select` o `radio`)
- El editor de opciones debe aparecer automáticamente basado en el schema de `/settings/input-types`

**Casos de uso del modo múltiple:**
- `files.allowedMimetypes` — formatos de archivo aceptados (opciones fijas en seed)
- `media.allowedMimetypes` — formatos de imagen aceptados (opciones fijas en seed)
- Settings custom creados por el admin con lista de opciones


---

## Endpoints de settings

```
GET  /settings/input-types       → schema de tipos (público)
GET  /settings/:key              → obtener setting por key (público)
POST /settings                   → crear setting (requiere settings.read + update)
PATCH /settings/:id              → actualizar setting (requiere settings.update)
DELETE /settings/:id             → eliminar setting (requiere settings.delete)
```

**Nota sobre PATCH:**
- Acepta **todos** los campos de `POST` como opcionales: `key`, `label`, `value`, `type`, `inputType`, `meta`, `order`, `categoryId`
- Enviar solo los campos que querés cambiar
- `meta` se reemplaza completo — si mandás `meta.options`, reemplaza las opciones existentes

**Ejemplo de actualización de opciones:**
```json
PATCH /settings/:id
{
  "meta": {
    "options": [
      { "value": "new1", "label": "Nueva opción 1" },
      { "value": "new2", "label": "Nueva opción 2" }
    ]
  }
}
```

---

### Categorías

```
GET    /setting-categories               → listar con paginación y settingsCount
GET    /setting-categories/:slug         → detalle con settings paginados
POST   /setting-categories              → crear categoría
PATCH  /setting-categories/:id          → actualizar categoría
DELETE /setting-categories/:id          → eliminar (solo si no tiene settings)
POST   /setting-categories/reorder      → reordenar drag & drop
```

### Campo `isProtected`

Settings y categorías creadas por el seed del core tienen `isProtected: true`. Las creadas por el admin tienen `isProtected: false` por defecto.

**Reglas en UI:**

- Si `isProtected: true` → deshabilitar el botón de eliminar
- Se puede editar el `value` de un setting protegido — solo está bloqueada la eliminación
- Las categorías protegidas tampoco se pueden eliminar

**Body de reorder:**

```json
{ "ids": [3, 1, 2] }
```

---

## Crear un setting completo

```json
POST /settings
{
  "categoryId": 1,
  "key": "app.primaryColor",
  "label": "Color primario",
  "value": "#1a1a2e",
  "description": "Color principal de la interfaz",
  "type": "string",
  "inputType": "color",
  "order": 1
}
```

**Con opciones (select):**

```json
{
  "key": "app.language",
  "label": "Idioma",
  "value": "es",
  "type": "string",
  "inputType": "select",
  "meta": {
    "options": [
      { "value": "es", "label": "Español" },
      { "value": "en", "label": "English" }
    ]
  }
}
```

**Con rango (number):**

```json
{
  "key": "pagination.limit",
  "label": "Items por página",
  "value": "20",
  "type": "number",
  "inputType": "number",
  "meta": { "min": 5, "max": 100 }
}
```

**Con imagen (image):**

```json
{
  "key": "app.logo",
  "label": "Logo del sitio",
  "value": "550e8400-e29b-41d4-a716-446655440000",
  "type": "string",
  "inputType": "image"
}
```
