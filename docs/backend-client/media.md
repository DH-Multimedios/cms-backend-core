# Media — Guía para proyectos cliente

Cómo usar el módulo Media desde módulos de negocio y extenderlo si es necesario.

---

## Inyectar el servicio

```typescript
import { Injectable } from '@nestjs/common';
import { MediaService } from '@dh/backend-core';

@Injectable()
export class ProductsService {
  constructor(private readonly mediaService: MediaService) {}

  async uploadProductImage(file: Express.Multer.File, userId: string, productName: string) {
    // Subir imagen programáticamente
    const uploaded = await this.mediaService.upload(file, userId, {
      alt: `Imagen del producto ${productName}`,
      usage: 'products',
    });

    // Guardar relación product <-> media
    await this.productRepository.update(productId, { imageUrl: uploaded.url });

    return uploaded;
  }
}
```

---

## API del MediaService

### `upload(file, uploadedByUserId, options)`

Sube una imagen con validación automática desde settings y extracción de dimensiones con Sharp.

**Parámetros:**

```typescript
file: Express.Multer.File           // Archivo Multer (buffer en memoria)
uploadedByUserId: string            // UUID del usuario que sube
options: {
  alt: string;                      // Texto alternativo (OBLIGATORIO para SEO/accesibilidad)
  usage?: string;                   // Categoría libre: 'products', 'logos', 'banners', etc. (default: 'general')
}
```

**Retorna:** `Promise<Media>`

**Errores:**

- `INTERNAL_ERROR`: Settings no configurados
- `VALIDATION_ERROR`: Tipo de imagen no permitido, excede tamaño máximo, o imagen corrupta
- `VALIDATION_ERROR`: Alt text faltante o vacío

**Ejemplo:**

```typescript
const media = await this.mediaService.upload(multerFile, currentUser.id, {
  alt: 'Logo de la empresa ABC en fondo blanco',
  usage: 'logos',
});

console.log(media.url); // https://api.example.com/uploads/media/user-123/logos/2026-04-11/abc-def.jpg
console.log(media.width); // 1920
console.log(media.height); // 1080
```

---

### `findAll(filters, userId?, hasListPermission?)`

Lista imágenes con filtros y control de acceso automático.

**Parámetros:**

```typescript
filters: {
  usage?: string;           // Filtrar por categoría
  uploadedByUserId?: string;// Filtrar por quien subió
  search?: string;          // Buscar en alt y originalName (case-insensitive)
}
userId?: string;            // Usuario actual (para restringir si no tiene permiso list)
hasListPermission?: boolean;// Si tiene permiso media.list (ve todas, sino solo las propias)
```

**Retorna:** `Promise<Media[]>`

**Ejemplo:**

```typescript
// Listar imágenes de productos subidas por un usuario específico
const productImages = await this.mediaService.findAll(
  { usage: 'products', uploadedByUserId: userId },
  userId,
  false, // Sin permiso list, solo ve las propias
);
```

---

### `findOne(id, userId?, hasReadPermission?)`

Obtiene una imagen por ID con control de acceso.

**Parámetros:**

```typescript
id: string;                 // UUID de la imagen
userId?: string;            // Usuario actual (para restringir si no tiene permiso read)
hasReadPermission?: boolean;// Si tiene permiso media.read (ve todas, sino solo las propias)
```

**Retorna:** `Promise<Media>`

**Errores:**

- `RESOURCE_NOT_FOUND`: Imagen no existe o el usuario no tiene acceso

**Ejemplo:**

```typescript
const media = await this.mediaService.findOne(mediaId, currentUser.id, false);
console.log(media.url); // URL pública de la imagen
```

---

### `update(id, updateDto, userId, hasEditPermission?)`

Actualiza el texto alternativo (alt) de una imagen. **Solo se puede editar el campo `alt`**.

**Parámetros:**

```typescript
id: string;                 // UUID de la imagen
updateDto: { alt: string }; // Nuevo texto alternativo
userId: string;             // Usuario que hace la edición (para auditoría)
hasEditPermission?: boolean;// Si tiene permiso media.edit
```

**Retorna:** `Promise<Media>`

**Errores:**

- `RESOURCE_NOT_FOUND`: Imagen no existe o el usuario no tiene acceso
- `VALIDATION_ERROR`: Alt text vacío

**Ejemplo:**

```typescript
const updated = await this.mediaService.update(
  mediaId,
  { alt: 'Logo de la empresa actualizado 2026' },
  currentUser.id,
  true,
);
```

---

### `remove(id, userId, hasDeletePermission?)`

Elimina una imagen (archivo físico + registro en DB).

**Parámetros:**

```typescript
id: string;                 // UUID de la imagen
userId: string;             // Usuario que elimina (para auditoría)
hasDeletePermission?: boolean;// Si tiene permiso media.delete
```

**Retorna:** `Promise<void>`

**Errores:**

- `RESOURCE_NOT_FOUND`: Imagen no existe o el usuario no tiene acceso

**Ejemplo:**

```typescript
await this.mediaService.remove(mediaId, currentUser.id, true);
```

---

## Configuración del módulo

El módulo Media usa **Settings** para validar uploads. Configurar desde seeds o dashboard:

```typescript
// src/database/seeds/settings.seeder.ts (ya incluido en el core)
{
  categoryId: 4, // Imágenes
  key: 'media.allowedMimetypes',
  value: '["image/jpeg","image/png","image/webp","image/gif"]',
  type: 'array',
},
{
  categoryId: 4,
  key: 'media.maxFileSize',
  value: '5242880', // 5MB en bytes
  type: 'number',
}
```

---

## Casos de uso comunes

### 1. Subir imagen de perfil de usuario

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly mediaService: MediaService) {}

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const avatar = await this.mediaService.upload(file, userId, {
      alt: `Avatar del usuario ${userId}`,
      usage: 'avatars',
    });

    await this.userRepository.update(userId, { avatarUrl: avatar.url });
    return avatar;
  }
}
```

### 2. Galería de imágenes de un producto

```typescript
@Injectable()
export class ProductsService {
  constructor(private readonly mediaService: MediaService) {}

  async addProductImage(productId: string, file: Express.Multer.File, userId: string) {
    const product = await this.productRepository.findOne(productId);

    const image = await this.mediaService.upload(file, userId, {
      alt: `Imagen del producto ${product.name}`,
      usage: 'products',
    });

    // Guardar relación en tabla intermedia product_images
    await this.productImageRepository.save({
      productId,
      mediaId: image.id,
      imageUrl: image.url,
      order: 0,
    });

    return image;
  }

  async getProductImages(productId: string) {
    const relations = await this.productImageRepository.find({
      where: { productId },
      order: { order: 'ASC' },
    });

    return relations.map((r) => r.imageUrl); // Array de URLs públicas
  }
}
```

### 3. Banner dinámico en homepage

```typescript
@Injectable()
export class BannersService {
  constructor(private readonly mediaService: MediaService) {}

  async createBanner(file: Express.Multer.File, userId: string, title: string) {
    const banner = await this.mediaService.upload(file, userId, {
      alt: `Banner: ${title}`,
      usage: 'banners',
    });

    await this.bannerRepository.save({
      title,
      imageUrl: banner.url,
      isActive: true,
    });

    return banner;
  }

  async getActiveBanners() {
    const banners = await this.bannerRepository.find({ where: { isActive: true } });
    return banners; // Frontend consume directamente banner.imageUrl (URL pública)
  }
}
```

---

## Extender el módulo Media

### Agregar validación personalizada

```typescript
import { Injectable, HttpStatus } from '@nestjs/common';
import { MediaService } from '@dh/backend-core';
import { ApiException, ErrorCode } from '@dh/backend-core';

@Injectable()
export class CustomMediaService extends MediaService {
  async upload(file: Express.Multer.File, uploadedByUserId: string, options: any) {
    // Validación personalizada: solo usuarios premium pueden subir imágenes >2MB
    const user = await this.userRepository.findOne(uploadedByUserId);
    if (!user.isPremium && file.size > 2 * 1024 * 1024) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN,
        'Solo usuarios premium pueden subir imágenes mayores a 2MB',
      );
    }

    // Llamar al método original
    return super.upload(file, uploadedByUserId, options);
  }
}
```

### Agregar resize on-demand

```typescript
import { Injectable } from '@nestjs/common';
import { MediaService } from '@dh/backend-core';
import * as sharp from 'sharp';
import * as path from 'path';

@Injectable()
export class ResizeMediaService extends MediaService {
  async getThumbnail(id: string, width: number): Promise<Buffer> {
    const media = await this.findOne(id);
    const fullPath = path.join(this.uploadPath, media.path);

    // Generar thumbnail con Sharp
    return sharp(fullPath).resize(width).toBuffer();
  }
}
```

Crear endpoint en un controller personalizado:

```typescript
@Get(':id/thumbnail')
async getThumbnail(
  @Param('id') id: string,
  @Query('width') width: number,
  @Res() res: Response,
) {
  const thumbnail = await this.resizeMediaService.getThumbnail(id, width);
  res.set('Content-Type', 'image/jpeg');
  res.send(thumbnail);
}
```

---

## Metadata automática

Al subir una imagen, **Sharp** extrae automáticamente:

- **width** (píxeles)
- **height** (píxeles)

Estos valores se guardan en la entidad `Media` y están disponibles en la respuesta.

**Uso:**

```typescript
const media = await this.mediaService.upload(file, userId, { alt: '...' });

console.log(media.width); // 1920
console.log(media.height); // 1080

// Calcular aspect ratio
const aspectRatio = media.width / media.height; // 1.777 (16:9)
```

---

## Auditoría

El módulo Media registra automáticamente las siguientes acciones en `AuditLog`:

| Acción   | Cuándo                | Metadata incluida                                   |
| -------- | --------------------- | --------------------------------------------------- |
| `upload` | Se sube una imagen    | filename, alt, size, mimetype, width, height, usage |
| `edit`   | Se edita el alt text  | oldAlt, newAlt                                      |
| `delete` | Se elimina una imagen | filename, alt, path                                 |

**NO se audita** el acceso a las URLs públicas (las imágenes son estáticas y no requieren autenticación).

**Ejemplo de consulta de auditoría:**

```typescript
const logs = await this.auditService.findAll({
  entity: 'Media',
  action: 'upload',
  userId: currentUser.id,
});
```

---

## Permisos

Los permisos de Media funcionan de manera similar a Files, pero con algunas diferencias:

| Permiso        | Comportamiento                                             |
| -------------- | ---------------------------------------------------------- |
| `media.list`   | Lista **todas** las imágenes. Sin él, solo ve las propias. |
| `media.read`   | Lee **todas** las imágenes. Sin él, solo ve las propias.   |
| `media.upload` | Puede subir imágenes.                                      |
| `media.edit`   | Puede editar el alt text de imágenes.                      |
| `media.delete` | Puede eliminar imágenes.                                   |

**Nota importante:** Las URLs de las imágenes son públicas — cualquiera con la URL puede verlas sin autenticación. Los permisos aplican solo a las operaciones de gestión (upload, edit, delete, list metadata).

---

## Diferencias entre Media y Files

| Característica       | Media                                | Files                                     |
| -------------------- | ------------------------------------ | ----------------------------------------- |
| **Tipos de archivo** | Solo imágenes (jpg, png, webp, gif)  | Genéricos (pdf, doc, xls, txt, etc.)      |
| **Acceso**           | Siempre público (URL directa)        | Privado por defecto, público opcional     |
| **Metadata**         | width, height, alt (obligatorio)     | name, description (opcionales)            |
| **Ownership**        | Solo uploadedByUserId                | uploadedByUserId + fileOwnerUserId        |
| **Descarga**         | URL pública directa                  | Endpoint protegido con auditoría          |
| **Procesamiento**    | Sharp extrae dimensiones             | Sin procesamiento                         |
| **Uso recomendado**  | Imágenes públicas (logos, productos) | Documentos privados (contratos, facturas) |

---

## Configuración de storage en producción

Por defecto, Media usa `process.env.UPLOADS_PATH` (defaults a `uploads/media`). En producción:

### Opción 1: Filesystem local

```env
UPLOADS_PATH=uploads/media
BASE_URL=https://api.example.com
```

**No hace falta configurar nada adicional.** `CoreModule` ya sirve `uploads/media/` como carpeta estática via `ServeStaticModule`. La carpeta se sirve bajo el prefijo `/uploads/media/`.

Si usás un path personalizado (distinto al default), configuralo en `CoreModule.registerAsync`:

```typescript
CoreModule.registerAsync({
  // ...
  useFactory: (config: ConfigService) => ({
    database: { ... },
    auth: { ... },
    modules: {
      media: { path: 'custom/media/path' }, // override del path físico
    },
  }),
})
```

### Opción 2: S3 / Cloud Storage (futura extensión)

Para usar S3, extender `MediaService` y sobrescribir `saveImageToDisk()` y `generatePublicUrl()`:

```typescript
@Injectable()
export class S3MediaService extends MediaService {
  private async saveImageToDisk(file: Express.Multer.File, storagePath: string): Promise<string> {
    const key = `${storagePath}/${uuidv4()}${path.extname(file.originalname)}`;
    await this.s3Client.putObject({
      Bucket: 'my-bucket',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    return key;
  }

  private generatePublicUrl(key: string): string {
    return `https://my-bucket.s3.amazonaws.com/${key}`;
  }
}
```

---

## Troubleshooting

### Error: "Configuración de media no encontrada"

Los settings `media.allowedMimetypes` y `media.maxFileSize` no existen en la tabla `settings`. Ejecutar seeds:

```bash
npm run seed
```

### Error: "No se pudo procesar la imagen"

La imagen está corrupta o no es una imagen válida. Validar antes de llamar a `upload()`:

```typescript
const isImage = file.mimetype.startsWith('image/');
if (!isImage) {
  throw new Error('El archivo no es una imagen válida');
}
```

### Las imágenes no cargan (404)

El servidor no está sirviendo `uploads/media/` como carpeta estática. Verificar en `main.ts`:

```typescript
app.useStaticAssets(join(process.cwd(), 'uploads/media'), {
  prefix: '/uploads/media/',
});
```

### Las dimensiones (width/height) son 0

Sharp no pudo leer los metadatos de la imagen. Posibles causas:

- La imagen está corrupta
- El formato no es compatible
- El buffer está vacío

Validar que `file.buffer` no esté vacío antes de llamar a `upload()`.

---

## Ejemplo completo: CRUD de imágenes de producto

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaService } from '@dh/backend-core';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly mediaService: MediaService,
  ) {}

  async addImage(productId: string, file: Express.Multer.File, userId: string) {
    const product = await this.productRepository.findOneOrFail({ where: { id: productId } });

    // Subir imagen a Media
    const media = await this.mediaService.upload(file, userId, {
      alt: `${product.name} - Vista principal`,
      usage: 'products',
    });

    // Crear relación
    const productImage = this.productImageRepository.create({
      productId,
      mediaId: media.id,
      url: media.url,
      alt: media.alt,
      width: media.width,
      height: media.height,
      order: 0,
    });

    return this.productImageRepository.save(productImage);
  }

  async listImages(productId: string) {
    return this.productImageRepository.find({
      where: { productId },
      order: { order: 'ASC' },
    });
  }

  async updateImageAlt(imageId: string, alt: string, userId: string) {
    const productImage = await this.productImageRepository.findOneOrFail({
      where: { id: imageId },
    });

    // Actualizar en Media
    const media = await this.mediaService.update(productImage.mediaId, { alt }, userId, true);

    // Actualizar en ProductImage
    productImage.alt = alt;
    return this.productImageRepository.save(productImage);
  }

  async deleteImage(imageId: string, userId: string) {
    const productImage = await this.productImageRepository.findOneOrFail({
      where: { id: imageId },
    });

    // Eliminar de Media (archivo físico + registro)
    await this.mediaService.remove(productImage.mediaId, userId, true);

    // Eliminar relación
    await this.productImageRepository.remove(productImage);
  }
}
```

---

## Preguntas frecuentes

### ¿Puedo subir imágenes privadas con Media?

**No.** Todas las imágenes en Media son públicas. Para imágenes privadas, usa el módulo **Files**.

### ¿Se pueden crear thumbnails automáticos?

Actualmente no. Media guarda solo el original. Para thumbnails:

1. Procesar en el frontend antes de mostrar
2. Implementar resize on-demand en el backend (ver sección "Extender el módulo")
3. Modificar `MediaService.upload()` para guardar múltiples versiones

### ¿Puedo cambiar el nombre del archivo?

No. El `filename` es generado (UUID + extensión) para evitar colisiones. Usa el campo `alt` para describir la imagen.

### ¿Cómo migro imágenes de Files a Media?

Si tienes imágenes en el módulo Files que deberían ser públicas:

1. Descargar la imagen desde Files (`filesService.download()`)
2. Subirla a Media (`mediaService.upload()`)
3. Actualizar las referencias en tu app
4. Eliminar de Files (`filesService.remove()`)

### ¿Qué pasa si elimino una imagen que está en uso?

El backend **NO valida** referencias. Es responsabilidad del módulo de negocio:

- Validar antes de eliminar
- Actualizar/eliminar referencias en otras tablas (productos, posts, etc.)
