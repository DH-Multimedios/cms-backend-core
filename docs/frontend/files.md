# Files — Guía para el frontend

Gestión documental con control de acceso, ownership y auditoría completa.

---

## Conceptos clave

### Files vs Media

- **Files**: Archivos genéricos (PDFs, Word, Excel, TXT, etc.) — este módulo
- **Media**: Imágenes con metadata visual (alt, width, height) — módulo separado

### Ownership dual

Cada archivo tiene dos usuarios relacionados:

- **uploadedByUserId**: Quien subió el archivo (inmutable)
- **fileOwnerUserId**: A quién pertenece el archivo (editable con permiso `files.edit`)
  - Si es `null` → archivo del sistema (solo accesible con permisos)

### Control de acceso

| Condición                                           | Puede descargar                 |
| --------------------------------------------------- | ------------------------------- |
| `isPublic = true`                                   | Todos (sin autenticación)       |
| `isPublic = false` + tiene permiso `files.download` | Sí                              |
| `isPublic = false` + es el `fileOwnerUserId`        | Sí (aunque no tenga el permiso) |
| Otros casos                                         | No                              |

---

## Configuración dinámica

Los tipos de archivo permitidos y el tamaño máximo se configuran desde **Settings**:

```typescript
// Obtener configuración desde GET /settings?categoryId={files-settings-id}
{
  "files.allowedMimetypes": ["application/pdf", "application/msword", ...],
  "files.maxFileSize": 10485760  // bytes (10MB)
}
```

Mostrar estos valores en el formulario de upload para guiar al usuario.

---

## Endpoints

### POST /files/upload

Sube un archivo. Requiere autenticación y permiso `files.upload`.

**Request (multipart/form-data):**

```typescript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('usage', 'contracts'); // REQUERIDO: categoría libre
formData.append('name', 'Contrato de servicios 2024'); // opcional
formData.append('description', 'Contrato anual con cliente ABC'); // opcional
formData.append('fileOwnerUserId', 'uuid-del-usuario'); // opcional (defaults a quien sube)
formData.append('isPublic', 'false'); // opcional (default: false)

await fetch('/files/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

**Response `201`:**

```json
{
  "statusCode": 201,
  "data": {
    "id": "uuid",
    "filename": "abc-123.pdf",
    "originalName": "contrato_2024.pdf",
    "name": "Contrato de servicios 2024",
    "description": "Contrato anual con cliente ABC",
    "mimetype": "application/pdf",
    "size": 1234567,
    "path": "123/contracts/2026-04-11/abc-123.pdf",
    "uploadedByUserId": "uuid",
    "fileOwnerUserId": "uuid",
    "usage": "contracts",
    "isPublic": false,
    "downloadCount": 0,
    "createdAt": "2026-04-11T...",
    "updatedAt": "2026-04-11T..."
  }
}
```

**Errores:**

| code               | Cuándo                                              |
| ------------------ | --------------------------------------------------- |
| `VALIDATION_ERROR` | Tipo de archivo no permitido o excede tamaño máximo |
| `INTERNAL_ERROR`   | Settings de archivos no configurados                |

---

### GET /files

Lista archivos con filtros.

- **Con permiso `files.list`**: ve todos los archivos
- **Sin permiso**: solo ve archivos donde `fileOwnerUserId` = su id

**Query params (todos opcionales):**

```typescript
GET /files?usage=contracts&fileOwnerUserId=uuid&isPublic=false&search=contrato
```

| Parámetro         | Tipo    | Descripción                                       |
| ----------------- | ------- | ------------------------------------------------- |
| `usage`           | string  | Filtrar por categoría                             |
| `fileOwnerUserId` | uuid    | Filtrar por dueño                                 |
| `isPublic`        | boolean | Filtrar públicos/privados                         |
| `search`          | string  | Buscar en nombre o descripción (case-insensitive) |

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "filename": "abc-123.pdf",
      "originalName": "contrato_2024.pdf",
      "name": "Contrato de servicios 2024",
      "description": "...",
      "mimetype": "application/pdf",
      "size": 1234567,
      "downloadCount": 5,
      "usage": "contracts",
      "isPublic": false,
      "createdAt": "2026-04-11T..."
    }
  ]
}
```

---

### GET /files/:id

Obtiene detalles de un archivo.

- **Público** si `isPublic = true`
- **Requiere autenticación** si `isPublic = false` (valida acceso)

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "filename": "abc-123.pdf",
    "originalName": "contrato_2024.pdf",
    "name": "Contrato de servicios 2024",
    "description": "...",
    "mimetype": "application/pdf",
    "size": 1234567,
    "path": "123/contracts/2026-04-11/abc-123.pdf",
    "uploadedByUserId": "uuid",
    "fileOwnerUserId": "uuid",
    "usage": "contracts",
    "isPublic": false,
    "downloadCount": 5,
    "createdAt": "2026-04-11T...",
    "updatedAt": "2026-04-11T..."
  }
}
```

**Errores:**

| code        | Cuándo                                                            |
| ----------- | ----------------------------------------------------------------- |
| `NOT_FOUND` | Archivo no existe                                                 |
| `FORBIDDEN` | Usuario sin acceso (no es público, no tiene permiso, no es dueño) |

---

### GET /files/:id/download

Descarga el archivo. Se audita cada descarga e incrementa `downloadCount`.

- **Público** si `isPublic = true`
- **Requiere autenticación + acceso** si `isPublic = false`

**Request:**

```typescript
// Opción 1: Descargar directamente en el navegador
window.open(`/api/files/${fileId}/download`);

// Opción 2: Con fetch para control manual
const response = await fetch(`/files/${fileId}/download`, {
  headers: { Authorization: `Bearer ${token}` },
});
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = response.headers.get('Content-Disposition').split('filename=')[1];
a.click();
```

**Response `200`:**

- Headers:
  - `Content-Type`: mimetype del archivo
  - `Content-Disposition`: `attachment; filename="nombre_original.pdf"`
  - `Content-Length`: tamaño en bytes
- Body: archivo binario

**Errores:**

| code        | Cuándo                                           |
| ----------- | ------------------------------------------------ |
| `NOT_FOUND` | Archivo no existe o archivo físico no encontrado |
| `FORBIDDEN` | Usuario sin acceso                               |

---

### PATCH /files/:id

Edita nombre, descripción o dueño del archivo. Requiere permiso `files.edit`.

**Request:**

```json
{
  "name": "Nuevo nombre del archivo",
  "description": "Nueva descripción",
  "fileOwnerUserId": "otro-uuid"
}
```

> Todos los campos son opcionales. Solo se actualizan los enviados.

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "name": "Nuevo nombre del archivo",
    "description": "Nueva descripción",
    "fileOwnerUserId": "otro-uuid",
    "updatedAt": "2026-04-11T..."
  }
}
```

---

### DELETE /files/:id

Elimina el archivo (físico y registro en DB). Requiere permiso `files.delete`.

**Response `204 No Content`**

**Errores:**

| code        | Cuándo            |
| ----------- | ----------------- |
| `NOT_FOUND` | Archivo no existe |

---

## UI recomendada

### Formulario de upload

```tsx
<FileUploadForm>
  <input type="file" accept={allowedMimetypes.join(',')} />
  <select name="usage">
    <option value="contracts">Contratos</option>
    <option value="invoices">Facturas</option>
    <option value="reports">Reportes</option>
    {/* Categorías libres definidas por el cliente */}
  </select>
  <input name="name" placeholder="Nombre descriptivo" />
  <textarea name="description" placeholder="Descripción (opcional)" />
  <select name="fileOwnerUserId">
    <option value={currentUser.id}>Mi perfil</option>
    {/* Si es admin, puede asignar a otros usuarios */}
  </select>
  <checkbox name="isPublic" label="Archivo público (descargable sin login)" />
  <small>Tamaño máximo: {maxFileSize / 1024 / 1024}MB</small>
</FileUploadForm>
```

### Lista de archivos

```tsx
<FileList>
  {files.map((file) => (
    <FileCard key={file.id}>
      <Icon type={file.mimetype} />
      <div>
        <h3>{file.name}</h3>
        <p>{file.description}</p>
        <small>
          {file.size} bytes • {file.downloadCount} descargas •
          {file.isPublic ? 'Público' : 'Privado'}
        </small>
      </div>
      <button onClick={() => downloadFile(file.id)}>Descargar</button>
    </FileCard>
  ))}
</FileList>
```

---

## Permisos disponibles

| Permiso          | Descripción                                                   |
| ---------------- | ------------------------------------------------------------- |
| `files.list`     | Listar todos los archivos (sin él, solo ve los propios)       |
| `files.read`     | Ver detalles de archivos                                      |
| `files.upload`   | Subir archivos                                                |
| `files.download` | Descargar archivos (sin él, solo puede descargar los propios) |
| `files.edit`     | Editar nombre, descripción o dueño                            |
| `files.delete`   | Eliminar archivos                                             |

---

## Storage

Los archivos se almacenan en:

```
uploads/files/{fileOwnerUserId}/{usage}/{YYYY-MM-DD}/{uuid}.ext
```

Si `fileOwnerUserId` es `null`:

```
uploads/files/system/{usage}/{YYYY-MM-DD}/{uuid}.ext
```

> ⚠️ Esta carpeta **NO está servida como estática**. Solo se accede via endpoint con autorización.

---

## Auditoría

Todas las acciones se auditan en la tabla `audit_logs`:

- **upload**: quien subió, tamaño, mimetype, usage, fileOwnerUserId
- **download**: quien descargó, cuándo, desde dónde (IP, userAgent)
- **update**: cambios en name, description, fileOwnerUserId (before/after)
- **delete**: quien eliminó, qué archivo (filename, usage)

Consultar auditoría con permiso `audit.read` en `GET /audit`.
