# Media — Guía para el frontend

Gestión de imágenes públicas con URLs directas, metadata automática y auditoría.

---

## Conceptos clave

### Media vs Files

- **Media**: Solo imágenes (JPG, PNG, WEBP, GIF) con URLs públicas — este módulo
- **Files**: Archivos genéricos privados (PDFs, Word, Excel) — módulo separado

### URLs públicas

**Todas las imágenes en Media son públicas** — se sirven directamente desde `uploads/media/` sin autenticación.

- **URL ejemplo**: `https://api.example.com/uploads/media/user-123/products/2026-04-11/abc-def.jpg`
- **Acceso**: Cualquiera con la URL puede ver la imagen (no requiere token)
- **Para imágenes privadas**: Usar el módulo Files, no Media

### Alt text obligatorio

El campo `alt` es **obligatorio** por SEO y accesibilidad. Rechazar uploads sin alt desde el frontend.

---

## Configuración dinámica

Los tipos de imagen permitidos y el tamaño máximo se configuran desde **Settings**:

```typescript
// Obtener configuración desde GET /settings?categoryId={media-settings-id}
{
  "media.allowedMimetypes": ["image/jpeg", "image/png", "image/webp", "image/gif"],
  "media.maxFileSize": 5242880  // bytes (5MB)
}
```

Mostrar estos valores en el formulario de upload para guiar al usuario.

---

## Endpoints

### POST /media/upload

Sube una imagen. Requiere autenticación y permiso `media.upload`.

**Request (multipart/form-data):**

```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('alt', 'Logo de la empresa en fondo blanco'); // REQUERIDO
formData.append('usage', 'logos'); // opcional (default: 'general')

await fetch('/media/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "abc-123.jpg",
    "originalName": "logo_empresa.jpg",
    "alt": "Logo de la empresa en fondo blanco",
    "mimetype": "image/jpeg",
    "size": 123456,
    "width": 1920,
    "height": 1080,
    "path": "user-123/logos/2026-04-11/abc-123.jpg",
    "url": "https://api.example.com/uploads/media/user-123/logos/2026-04-11/abc-123.jpg",
    "uploadedByUserId": "uuid",
    "usage": "logos",
    "createdAt": "2026-04-11T...",
    "updatedAt": "2026-04-11T..."
  }
}
```

**Errores:**

| code               | Cuándo                      |
| ------------------ | --------------------------- |
| `VALIDATION_ERROR` | Tipo de imagen no permitido |
| `VALIDATION_ERROR` | Imagen excede tamaño máximo |
| `VALIDATION_ERROR` | Imagen corrupta o inválida  |
| `VALIDATION_ERROR` | Alt text faltante o vacío   |

---

### GET /media

Lista imágenes. Con permiso `media.list` ve todas, sin permiso solo las propias.

**Query params:**

```typescript
GET /media?usage=logos&search=empresa&uploadedByUserId=uuid
```

| Param              | Tipo     | Descripción                                         |
| ------------------ | -------- | --------------------------------------------------- |
| `usage`            | `string` | Filtrar por categoría de uso                        |
| `uploadedByUserId` | `uuid`   | Filtrar por quien subió la imagen                   |
| `search`           | `string` | Buscar en `alt` y `originalName` (case-insensitive) |

**Response `200`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "abc-123.jpg",
      "originalName": "logo_empresa.jpg",
      "alt": "Logo de la empresa en fondo blanco",
      "mimetype": "image/jpeg",
      "size": 123456,
      "width": 1920,
      "height": 1080,
      "path": "user-123/logos/2026-04-11/abc-123.jpg",
      "url": "https://api.example.com/uploads/media/user-123/logos/2026-04-11/abc-123.jpg",
      "uploadedByUserId": "uuid",
      "usage": "logos",
      "createdAt": "2026-04-11T...",
      "updatedAt": "2026-04-11T..."
    }
  ]
}
```

---

### GET /media/:id

Obtiene detalles de una imagen. Con permiso `media.read` ve todas, sin permiso solo las propias.

**Response `200`:** Mismo formato que el objeto individual de `GET /media`.

**Errores:**

| code                 | Cuándo                                        |
| -------------------- | --------------------------------------------- |
| `RESOURCE_NOT_FOUND` | Imagen no existe o el usuario no tiene acceso |

---

### PATCH /media/:id

Edita el `alt` text de una imagen. Requiere permiso `media.edit`.

**Request:**

```json
{
  "alt": "Logo de la empresa actualizado 2026"
}
```

**Response `200`:** Objeto `Media` actualizado.

**Errores:**

| code                 | Cuándo           |
| -------------------- | ---------------- |
| `RESOURCE_NOT_FOUND` | Imagen no existe |
| `VALIDATION_ERROR`   | Alt text vacío   |

---

### DELETE /media/:id

Elimina una imagen (archivo físico + registro DB). Requiere permiso `media.delete`.

**Response `204`:** Sin contenido.

**Errores:**

| code                 | Cuándo           |
| -------------------- | ---------------- |
| `RESOURCE_NOT_FOUND` | Imagen no existe |

---

## Permisos

| Permiso        | Descripción                                                   |
| -------------- | ------------------------------------------------------------- |
| `media.list`   | Listar todas las imágenes (sin él, solo ve las propias)       |
| `media.read`   | Ver detalles de todas las imágenes (sin él, solo las propias) |
| `media.upload` | Subir imágenes                                                |
| `media.edit`   | Editar el alt text de imágenes                                |
| `media.delete` | Eliminar imágenes                                             |

El rol **SuperAdmin** tiene todos los permisos. El rol **Admin** tiene `media.upload` y `media.edit` por defecto.

---

## Uso de las imágenes

### Mostrar imagen en el frontend

Como las imágenes son públicas, usa la URL directamente:

```tsx
<img src={media.url} alt={media.alt} width={media.width} height={media.height} />
```

**Optimización SEO/performance:**

- Siempre incluye `alt`, `width` y `height` para evitar layout shift
- El servidor responde con cache headers para imágenes estáticas

### Galería de imágenes

```tsx
const { data: images } = await fetch('/media?usage=gallery');

return (
  <div className="grid">
    {images.data.map((img) => (
      <img
        key={img.id}
        src={img.url}
        alt={img.alt}
        width={img.width}
        height={img.height}
        loading="lazy"
      />
    ))}
  </div>
);
```

---

## Metadata automática

Al subir una imagen, **Sharp** extrae automáticamente:

- **width** (píxeles)
- **height** (píxeles)

El frontend recibe estos valores en la respuesta del upload — úsalos para evitar layout shift.

---

## Categorías de uso (examples)

El campo `usage` es libre (string), pero se recomienda usar categorías consistentes:

| Usage      | Descripción                                 |
| ---------- | ------------------------------------------- |
| `logos`    | Logos de empresas/marcas                    |
| `banners`  | Banners promocionales                       |
| `products` | Imágenes de productos                       |
| `avatars`  | Avatares de usuarios                        |
| `gallery`  | Galerías públicas                           |
| `posts`    | Imágenes de posts/artículos                 |
| `general`  | Imágenes sin categoría específica (default) |

Coordina con el backend para mantener consistencia.

---

## Auditoría

Las siguientes acciones se registran en **Audit**:

| Acción   | Cuándo                | Metadata incluida                                   |
| -------- | --------------------- | --------------------------------------------------- |
| `upload` | Se sube una imagen    | filename, alt, size, mimetype, width, height, usage |
| `edit`   | Se edita el alt text  | oldAlt, newAlt                                      |
| `delete` | Se elimina una imagen | filename, alt, path                                 |

**NO se audita** el acceso a las URLs públicas (las imágenes son estáticas).

---

## Preguntas frecuentes

### ¿Cómo subo una imagen privada?

**No uses Media.** Las imágenes en Media son siempre públicas. Para imágenes privadas, usa el módulo **Files**:

```typescript
// Files: imagen privada con control de acceso
formData.append('file', imageFile);
formData.append('usage', 'private-photos');
formData.append('isPublic', 'false');
await fetch('/files/upload', ...);
```

### ¿Cómo muestro una imagen privada en el frontend?

Opción 1: Descargar como blob y crear un objeto URL:

```typescript
const response = await fetch(`/files/${id}/download`, {
  headers: { Authorization: `Bearer ${token}` },
});
const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);

<img src={imageUrl} alt="..." />;
```

Opción 2: Endpoint dedicado que valida permisos y devuelve la imagen directamente (implementar en backend si es necesario).

### ¿Se pueden crear thumbnails automáticos?

**Actualmente no.** Media guarda solo el original. Para thumbnails:

- **Opción 1**: Procesarlas en el frontend con canvas/sharp antes de mostrar
- **Opción 2**: Implementar resize on-demand en el backend (endpoint `/media/:id/thumbnail?width=300`)
- **Opción 3**: Procesar thumbnails al subir (requiere modificar MediaService)

### ¿Puedo cambiar el nombre del archivo?

No. El `filename` es generado (UUID + extensión) para evitar colisiones. El `originalName` es solo informativo. Usa el campo `alt` para describir la imagen.

### ¿Puedo mover una imagen a otra categoría (usage)?

No directamente. El `usage` se define al subir y no es editable. Para cambiar de categoría:

1. Subir la imagen con el nuevo `usage`
2. Actualizar las referencias en tu app
3. Eliminar la imagen antigua

### ¿Qué pasa si elimino una imagen que está en uso?

El backend **NO valida** si la imagen está referenciada en otros recursos. Es responsabilidad del frontend:

- Confirmar con el usuario antes de eliminar
- Actualizar/eliminar referencias en otros módulos (productos, posts, etc.)

---

## Ejemplo completo: Upload de imagen con preview

```tsx
import { useState } from 'react';

function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file || !alt) {
      alert('Selecciona una imagen y agrega texto alternativo');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', alt);
    formData.append('usage', 'products');

    const response = await fetch('/media/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      console.log('Imagen subida:', result.data.url);
      // Resetear form
      setFile(null);
      setAlt('');
      setPreview(null);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
      />
      {preview && <img src={preview} alt="Preview" style={{ maxWidth: 300 }} />}
      <input
        type="text"
        placeholder="Texto alternativo (obligatorio)"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
      />
      <button onClick={handleUpload} disabled={!file || !alt}>
        Subir imagen
      </button>
    </div>
  );
}
```

---

## Troubleshooting

### Error: "Tipo de imagen no permitido"

Verifica que el mimetype de la imagen esté en `media.allowedMimetypes` (Settings). Por defecto:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

### Error: "La imagen excede el tamaño máximo"

Revisa `media.maxFileSize` en Settings (default: 5MB). Si necesitas subir imágenes más grandes:

1. Actualiza el setting desde el dashboard
2. O comprime la imagen antes de subirla

### Error: "No se pudo procesar la imagen"

La imagen está corrupta o no es una imagen válida. Valida el archivo antes de subirlo:

```typescript
const isValidImage = file.type.startsWith('image/');
if (!isValidImage) {
  alert('El archivo no es una imagen válida');
  return;
}
```

### Las imágenes no cargan (404)

Verifica que el servidor esté configurado para servir `uploads/media/` como carpeta estática. En NestJS esto se hace en `main.ts` con `app.useStaticAssets()`.
