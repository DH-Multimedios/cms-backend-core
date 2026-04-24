# Taxonomies — Guía para el frontend

Clasificación jerárquica de contenido. Se usa para categorías de productos, tags, secciones de blog, o cualquier agrupación que el proyecto necesite.

---

## Conceptos clave

### Tipos libres

El campo `type` es un string libre. Cada proyecto define sus propios tipos:

| type               | Uso ejemplo             |
| ------------------ | ----------------------- |
| `product-category` | Categorías de productos |
| `blog-tag`         | Tags de artículos       |
| `blog-section`     | Secciones del blog      |
| `faq-category`     | Categorías de FAQ       |

### Jerarquía

Las taxonomías soportan **anidación** — una taxonomía puede tener `parentId` apuntando a otra del mismo tipo. Útil para categorías con subcategorías.

### Asociación polimórfica

Se pueden asociar taxonomías a cualquier entidad del sistema mediante la tabla pivot `EntityTaxonomy`. Ejemplo: un `Product` con varias categorías.

---

## Endpoints

### GET /taxonomies

Lista paginada de taxonomías. **Público** (no requiere auth).

**Query params:**

| Param      | Tipo   | Descripción                                |
| ---------- | ------ | ------------------------------------------ |
| `type`     | string | Filtrar por tipo (ej: `product-category`)  |
| `parentId` | UUID   | Filtrar hijos de un padre específico       |
| `root`     | `true` | Solo taxonomías raíz (`parentId IS NULL`)  |
| `search`   | string | Buscar en nombre y slug (case-insensitive) |
| `page`     | number | Default: 1                                 |
| `limit`    | number | Default: 20                                |

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Electrónica",
        "slug": "electronica",
        "type": "product-category",
        "description": "Productos electrónicos",
        "imageId": null,
        "parentId": null,
        "order": 0,
        "childrenCount": 3,
        "createdAt": "2026-01-01T...",
        "updatedAt": "2026-04-11T..."
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

> `childrenCount` indica cuántas taxonomías hijas tiene. Útil para mostrar un indicador de expansión.

---

### GET /taxonomies/:id

Obtiene una taxonomía por ID. **Público**.

**Response `200`:** Mismo shape que un item del listado.

**Errores:** `TAXONOMY_NOT_FOUND`

---

### POST /taxonomies

Crea una nueva taxonomía.

**Permiso:** `taxonomies.create`

**Request:**

```json
{
  "name": "Electrónica",
  "type": "product-category",
  "description": "Productos electrónicos",
  "imageId": "uuid-de-media",
  "parentId": "uuid-padre",
  "order": 0
}
```

| Campo         | Requerido | Validación                                        |
| ------------- | --------- | ------------------------------------------------- |
| `name`        | ✓         | Máx 255 chars                                     |
| `type`        | ✓         | Máx 100 chars                                     |
| `slug`        | ✗         | Auto-generado desde `name` si no se envía. Único. |
| `description` | ✗         |                                                   |
| `imageId`     | ✗         | UUID de una imagen de Media                       |
| `parentId`    | ✗         | UUID de taxonomía padre                           |
| `order`       | ✗         | Default: 0                                        |

**Response `201`:** Taxonomía creada.

**Errores:**

| code                   | Cuándo                  |
| ---------------------- | ----------------------- |
| `TAXONOMY_SLUG_EXISTS` | El slug ya está en uso  |
| `TAXONOMY_NOT_FOUND`   | El `parentId` no existe |

---

### PATCH /taxonomies/:id

Actualiza una taxonomía. Todos los campos son opcionales.

**Permiso:** `taxonomies.update`

**Request:** mismos campos que POST, todos opcionales.

**Errores:**

| code                      | Cuándo                                   |
| ------------------------- | ---------------------------------------- |
| `TAXONOMY_NOT_FOUND`      | Taxonomía no existe                      |
| `TAXONOMY_SLUG_EXISTS`    | El slug ya está en uso                   |
| `TAXONOMY_INVALID_PARENT` | Se intentó asignar como padre a sí misma |

> Si se cambia el `name` y no se envía `slug`, el slug se regenera automáticamente.

---

### DELETE /taxonomies/:id

Elimina una taxonomía.

**Permiso:** `taxonomies.delete`

**Response `200`:**

```json
{ "statusCode": 200, "data": { "message": "Taxonomía 'Electrónica' eliminada" } }
```

**Errores:**

| code                    | Cuándo                                                      |
| ----------------------- | ----------------------------------------------------------- |
| `TAXONOMY_NOT_FOUND`    | Taxonomía no existe                                         |
| `TAXONOMY_HAS_CHILDREN` | Tiene taxonomías hijas — eliminarlas o reasignarlas primero |

---

### PATCH /taxonomies/reorder

Reordena taxonomías (drag & drop). Todas las taxonomías del array deben ser del mismo nivel (mismo `parentId`).

**Permiso:** `taxonomies.update`

**Request:**

```json
{ "ids": ["uuid-3", "uuid-1", "uuid-2"] }
```

**Response `200`:**

```json
{ "statusCode": 200, "data": { "message": "Orden actualizado" } }
```

---

### GET /taxonomies/entity/:entityType/:entityId

Obtiene las taxonomías asociadas a una entidad. **Público**.

**Ejemplo:**

```
GET /taxonomies/entity/Product/uuid-del-producto
```

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "name": "Electrónica",
      "slug": "electronica",
      "type": "product-category",
      "order": 0
    }
  ]
}
```

---

### PUT /taxonomies/entity/:entityType/:entityId

Sincroniza (reemplaza) las taxonomías de una entidad. Envía la lista completa de IDs.

**Permiso:** `taxonomies.update`

**Request:**

```json
{ "taxonomyIds": ["uuid-tax-1", "uuid-tax-2"] }
```

> Para desasociar todas, enviar `taxonomyIds: []`.

**Response `200`:**

```json
{ "statusCode": 200, "data": null }
```

---

## Flujo recomendado en UI

### Selector de categorías (árbol)

1. Cargar raíces: `GET /taxonomies?type=product-category&root=true`
2. Al expandir un nodo: `GET /taxonomies?type=product-category&parentId={id}`
3. Mostrar `childrenCount` para saber si tiene hijos

### CRUD de categorías (admin)

1. Listar: `GET /taxonomies?type=product-category`
2. Crear: `POST /taxonomies` con `type: "product-category"`
3. Editar: `PATCH /taxonomies/:id`
4. Eliminar: `DELETE /taxonomies/:id` (validar que no tenga hijos)
5. Reordenar: `PATCH /taxonomies/reorder` con drag & drop

### Asignar categorías a un producto

```typescript
// Al guardar el formulario del producto
await fetch(`/taxonomies/entity/Product/${productId}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ taxonomyIds: selectedCategoryIds }),
});

// Al cargar el formulario
const response = await fetch(`/taxonomies/entity/Product/${productId}`);
const categories = response.data; // Para preseleccionar en el form
```

---

## Permisos

| Permiso             | Descripción                               |
| ------------------- | ----------------------------------------- |
| `taxonomies.create` | Crear taxonomías                          |
| `taxonomies.update` | Editar, reordenar y sincronizar entidades |
| `taxonomies.delete` | Eliminar taxonomías                       |

> Los endpoints de lectura son públicos — no requieren permiso.

---

## Auditoría

| Acción   | Cuándo                       |
| -------- | ---------------------------- |
| `create` | Se crea una taxonomía        |
| `update` | Se edita nombre, slug o tipo |
| `delete` | Se elimina una taxonomía     |
