# Files — Guía para proyectos cliente

Cómo usar el módulo Files desde módulos de negocio y extenderlo si es necesario.

---

## Inyectar el servicio

```typescript
import { Injectable } from '@nestjs/common';
import { FilesService } from '@dh/backend-core';

@Injectable()
export class InvoicesService {
  constructor(private readonly filesService: FilesService) {}

  async attachFileToInvoice(invoiceId: string, file: Express.Multer.File, userId: string) {
    // Subir archivo programáticamente
    const uploaded = await this.filesService.upload(file, userId, {
      usage: 'invoices',
      fileOwnerUserId: userId,
      name: `Factura ${invoiceId}`,
      description: `Archivo adjunto a factura ${invoiceId}`,
      isPublic: false,
    });

    // Guardar relación invoice <-> file
    await this.invoiceRepository.update(invoiceId, { fileId: uploaded.id });

    return uploaded;
  }
}
```

---

## API del FilesService

### `upload(file, uploadedByUserId, options)`

Sube un archivo con validación automática desde settings.

**Parámetros:**

```typescript
file: Express.Multer.File           // Archivo Multer (buffer en memoria)
uploadedByUserId: string            // UUID del usuario que sube
options: {
  fileOwnerUserId?: string;         // UUID del dueño (defaults a uploadedByUserId)
  usage: string;                    // Categoría libre: 'invoices', 'contracts', etc.
  name?: string;                    // Nombre descriptivo (defaults a originalName)
  description?: string | null;      // Descripción opcional
  isPublic?: boolean;               // Si es descargable sin autenticación (default: false)
}
```

**Retorna:** `Promise<File>`

**Errores:**

- `INTERNAL_ERROR`: Settings no configurados
- `VALIDATION_ERROR`: Tipo de archivo no permitido o excede tamaño máximo

**Ejemplo:**

```typescript
const file = await this.filesService.upload(multerFile, currentUser.id, {
  usage: 'contracts',
  fileOwnerUserId: clientId,
  name: 'Contrato de servicios 2024',
  description: 'Contrato anual con renovación automática',
  isPublic: false,
});
```

---

### `findAll(filters, userId?, hasListPermission?)`

Lista archivos con filtros y control de acceso automático.

**Parámetros:**

```typescript
filters: {
  usage?: string;              // Filtrar por categoría
  fileOwnerUserId?: string;    // Filtrar por dueño
  isPublic?: boolean;          // Filtrar públicos/privados
  search?: string;             // Buscar en name o description
}
userId?: string                // Usuario actual (opcional)
hasListPermission?: boolean    // Si tiene permiso files.list (opcional)
```

**Retorna:** `Promise<File[]>`

**Lógica de acceso:**

- Si `hasListPermission = true` → ve todos los archivos
- Si `hasListPermission = false` → solo ve archivos donde `fileOwnerUserId = userId`

**Ejemplo:**

```typescript
// Listar todos los archivos de facturas de un cliente
const files = await this.filesService.findAll({
  usage: 'invoices',
  fileOwnerUserId: clientId,
});
```

---

### `findOne(id, userId?, hasDownloadPermission?)`

Obtiene un archivo por ID con validación de acceso.

**Parámetros:**

```typescript
id: string                     // UUID del archivo
userId?: string                // Usuario actual (opcional)
hasDownloadPermission?: boolean // Si tiene permiso files.download (opcional)
```

**Retorna:** `Promise<File>`

**Errores:**

- `NOT_FOUND`: Archivo no existe
- `FORBIDDEN`: Usuario sin acceso

---

### `download(id, userId?, hasDownloadPermission?)`

Descarga un archivo con auditoría e incremento de contador.

**Retorna:**

```typescript
Promise<{
  file: File;
  stream: StreamableFile;
}>;
```

**Uso desde controller:**

```typescript
@Get(':id/download')
async downloadInvoiceFile(
  @Param('id') id: string,
  @CurrentUser() user: User,
  @Res({ passthrough: true }) res: Response,
) {
  const { file, stream } = await this.filesService.download(id, user.id, false);

  res.set({
    'Content-Type': file.mimetype,
    'Content-Disposition': `attachment; filename="${file.originalName}"`,
  });

  return stream;
}
```

---

### `update(id, dto, userId)`

Actualiza nombre, descripción o dueño del archivo. Requiere permiso `files.edit`.

**Parámetros:**

```typescript
id: string
dto: {
  name?: string;
  description?: string;
  fileOwnerUserId?: string;
}
userId: string  // Para auditoría
```

**Retorna:** `Promise<File>`

---

### `remove(id, userId)`

Elimina el archivo (físico y registro). Requiere permiso `files.delete`.

**Parámetros:**

```typescript
id: string;
userId: string; // Para auditoría
```

**Retorna:** `Promise<void>`

**Ejemplo:**

```typescript
await this.filesService.remove(fileId, currentUser.id);
```

---

## Relaciones con entidades de negocio

### Opción 1: FK directo (archivo único)

```typescript
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  fileId: string | null;

  @ManyToOne(() => File, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fileId' })
  file: File | null;
}
```

### Opción 2: Tabla pivot (múltiples archivos)

```typescript
@Entity('invoice_files')
export class InvoiceFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoiceId: string;

  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'uuid' })
  fileId: string;

  @ManyToOne(() => File, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @Column({ default: 0 })
  order: number; // Para ordenar archivos
}
```

---

## Validación personalizada

Si necesitás validaciones adicionales (ej: solo PDFs para contratos):

```typescript
async uploadContract(file: Express.Multer.File, userId: string) {
  // Validación custom
  if (file.mimetype !== 'application/pdf') {
    throw new ApiException(
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_ERROR,
      'Los contratos solo aceptan archivos PDF',
    );
  }

  // Upload usando el servicio del core
  return this.filesService.upload(file, userId, {
    usage: 'contracts',
    name: file.originalname,
    isPublic: false,
  });
}
```

---

## Settings de configuración

Los archivos se validan contra settings dinámicos:

| Key                      | Tipo           | Descripción                 | Default                                          |
| ------------------------ | -------------- | --------------------------- | ------------------------------------------------ |
| `files.allowedMimetypes` | `json` (array) | Tipos de archivo permitidos | `['application/pdf', 'application/msword', ...]` |
| `files.maxFileSize`      | `number`       | Tamaño máximo en bytes      | `10485760` (10MB)                                |

Para ajustar desde el dashboard:

```
GET /settings?categoryId={files-settings-category-id}
PATCH /settings/{setting-id}
```

---

## Categorías de uso (usage)

El campo `usage` es **libre**. Cada proyecto define sus propias categorías:

Ejemplos:

- `contracts` — Contratos
- `invoices` — Facturas
- `receipts` — Recibos
- `reports` — Reportes
- `legal-documents` — Documentos legales
- `employee-documents` — Documentos de empleados

Usá categorías claras y consistentes en todo el proyecto.

---

## Ownership dual

Cada archivo tiene dos usuarios:

- **uploadedByUserId**: Quien ejecutó el upload (inmutable)
- **fileOwnerUserId**: A quién pertenece (editable con `files.edit`)

**Casos de uso:**

### Admin sube documento al perfil de un cliente

```typescript
await this.filesService.upload(file, adminUser.id, {
  usage: 'contracts',
  fileOwnerUserId: clientUser.id, // El cliente es el dueño
  name: 'Contrato de servicios',
  isPublic: false,
});
```

- `uploadedByUserId` = admin
- `fileOwnerUserId` = cliente
- El **cliente** puede descargar aunque no tenga permiso `files.download`

### Sistema genera documento (sin dueño)

```typescript
await this.filesService.upload(generatedPdf, systemUser.id, {
  usage: 'reports',
  fileOwnerUserId: null, // Archivo del sistema
  name: 'Reporte mensual',
  isPublic: true, // Público para todos
});
```

- `fileOwnerUserId` = `null` → archivo del sistema
- Solo usuarios con `files.download` pueden acceder (salvo que sea público)

---

## Eventos y hooks

Si necesitás ejecutar lógica después de subir un archivo:

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly filesService: FilesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async uploadInvoiceFile(file: Express.Multer.File, invoiceId: string, userId: string) {
    const uploaded = await this.filesService.upload(file, userId, {
      usage: 'invoices',
      fileOwnerUserId: userId,
    });

    // Emitir evento custom
    this.eventEmitter.emit('invoice.file.uploaded', {
      invoiceId,
      fileId: uploaded.id,
      userId,
    });

    return uploaded;
  }
}
```

---

## Storage físico

Los archivos se guardan en:

```
{UPLOADS_PATH}/{fileOwnerUserId}/{usage}/{YYYY-MM-DD}/{uuid}.ext
```

**Variable de entorno:**

```env
UPLOADS_PATH=uploads/files  # Default: 'uploads/files'
```

Si `fileOwnerUserId` es `null`:

```
uploads/files/system/{usage}/{YYYY-MM-DD}/{uuid}.ext
```

> ⚠️ **NO servir** `uploads/files/` como estática. Solo `uploads/media/` debe ser pública.

---

## Auditoría automática

El core audita automáticamente:

- **upload**: quien subió, tamaño, mimetype, usage, fileOwnerUserId
- **download**: quien descargó, IP, userAgent
- **update**: cambios en metadata (before/after)
- **delete**: quien eliminó, qué archivo

No necesitás auditar manualmente cuando usás `FilesService`.

---

## Migrar archivos existentes

Si ya tenés archivos en otro sistema:

```typescript
import { FilesService } from '@dh/backend-core';
import * as fs from 'fs';

async migrateLegacyFiles() {
  const legacyFiles = await this.legacyDb.getFiles();

  for (const legacy of legacyFiles) {
    // Leer archivo del storage viejo
    const buffer = fs.readFileSync(legacy.path);

    // Crear objeto Multer-like
    const multerFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: legacy.originalName,
      encoding: '7bit',
      mimetype: legacy.mimetype,
      buffer,
      size: buffer.length,
    } as any;

    // Upload al nuevo sistema
    await this.filesService.upload(multerFile, legacy.uploadedBy, {
      usage: legacy.category,
      fileOwnerUserId: legacy.ownerId,
      name: legacy.name,
      description: legacy.description,
      isPublic: legacy.isPublic,
    });

    console.log(`✅ Migrado: ${legacy.name}`);
  }
}
```

---

## Testing

```typescript
import { Test } from '@nestjs/testing';
import { FilesService, FilesModule } from '@dh/backend-core';

describe('InvoicesService', () => {
  let filesService: FilesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [FilesModule],
      providers: [InvoicesService],
    }).compile();

    filesService = module.get(FilesService);
  });

  it('should upload invoice file', async () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'invoice.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('fake-pdf-content'),
      size: 1024,
    } as any;

    const result = await filesService.upload(mockFile, 'user-uuid', {
      usage: 'invoices',
      name: 'Factura 001',
    });

    expect(result.id).toBeDefined();
    expect(result.usage).toBe('invoices');
  });
});
```

---

## Permisos disponibles

| Permiso          | Descripción               |
| ---------------- | ------------------------- |
| `files.list`     | Listar todos los archivos |
| `files.read`     | Ver detalles              |
| `files.upload`   | Subir archivos            |
| `files.download` | Descargar archivos        |
| `files.edit`     | Editar metadata           |
| `files.delete`   | Eliminar archivos         |

Los permisos se registran automáticamente en el seed del core. No necesitás registrarlos en tu módulo.
