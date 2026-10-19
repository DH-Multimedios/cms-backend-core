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

**Límite de confianza:** este servicio no autentica al llamador ni consulta permisos para `upload`, `findAll`, `findOne`, `update` o `remove`. Sus flags booleanos son afirmaciones del endpoint, no pruebas: protegé el endpoint con `SessionAuthGuard` y, para mutaciones, `PermissionsGuard` + `@RequirePermissions(...)`; derivá usuario y flags de la sesión, nunca de parámetros del cliente. La URL estática de Media es pública, pero la metadata y las mutaciones necesitan autorización.

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
- El DTO del endpoint valida `alt`; las llamadas directas a `MediaService.upload()` deben validarlo en el cliente antes de invocar el servicio.

**Ejemplo:**

```typescript
const media = await this.mediaService.upload(multerFile, currentUser.id, {
  alt: 'Logo de la empresa ABC en fondo blanco',
  usage: 'logos',
});

console.log(media.url); // /uploads/media/user-123/logos/2026-04-11/abc-def.jpg (ruta relativa al origen de la API)
console.log(media.width); // 1920
console.log(media.height); // 1080
```

---

### `findAll(filters, userId?, hasListPermission?)`

Lista metadata de imágenes con filtros. En endpoints del cliente, obtené `userId` de la sesión y derivá `hasListPermission` de permisos comprobados en el servidor; **sin `userId`, el servicio no restringe por uploader** aunque el flag sea `false`.

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

**Retorna:** `Promise<PaginatedResult<Media>>`, con `{ items, total, page, limit, pages }` (por defecto `page=1`, `limit=20`).

**Ejemplo:**

```typescript
// Listar imágenes de productos subidas por un usuario específico
const { items: productImages, total } = await this.mediaService.findAll(
  { usage: 'products', uploadedByUserId: userId },
  userId,
  false, // Sin permiso list, solo ve las propias
);
```

---

### `findOne(id, userId?, hasReadPermission?)`

Obtiene metadata de una imagen por ID. Solo filtra por uploader cuando se proporciona `userId` y `hasReadPermission=false`; no ofrece autenticación propia. La URL estática de la imagen es pública.

**Parámetros:**

```typescript
id: string;                 // UUID de la imagen
userId?: string;            // ID de la sesión autenticada
hasReadPermission?: boolean;// Solo true tras comprobar media.read en el servidor
```

**Retorna:** `Promise<Media>`

**Errores:**

- `NOT_FOUND`: Imagen inexistente o no visible por el filtro de uploader

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
userId: string;             // ID autenticado (y para auditoría)
hasEditPermission?: boolean;// Solo true tras comprobar media.edit; permite editar imágenes ajenas
```

**Retorna:** `Promise<Media>`

**Errores:**

- `NOT_FOUND`: Imagen inexistente o no visible por el filtro de uploader.
- El DTO del endpoint valida `alt`; la llamada directa al servicio no valida si está vacío.

**Ejemplo:** dentro de un endpoint que ya comprobó `media.edit`, limitado a una imagen propia por el flag `false`:

```typescript
const updated = await this.mediaService.update(
  mediaId,
  { alt: 'Logo de la empresa actualizado 2026' },
  currentUser.id,
  false, // Acceso a una imagen propia; comprobar media.edit antes de dar acceso global
);
```

---

### `remove(id, userId, hasDeletePermission?)`

Elimina una imagen (archivo físico + registro en DB).

**Parámetros:**

```typescript
id: string;                 // UUID de la imagen
userId: string;             // ID autenticado (y para auditoría)
hasDeletePermission?: boolean;// Solo true tras comprobar media.delete; permite eliminar imágenes ajenas
```

**Retorna:** `Promise<void>`

**Errores:**

- `NOT_FOUND`: Imagen inexistente o no visible por el filtro de uploader.

**Ejemplo:**

```typescript
// En un endpoint autenticado que ya comprobó media.delete; false limita a imágenes propias.
await this.mediaService.remove(mediaId, currentUser.id, false);
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
  type: 'json',
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
    return banners; // imageUrl es relativa a la API; el frontend debe anteponer el origen de la API
  }
}
```

---

## Extender el módulo Media

`MediaService` no ofrece hooks de almacenamiento ni un `uploadPath` público/protegido: `saveImageToDisk()`, `generatePublicUrl()` y `uploadPath` son miembros `private`. No los sobrescribas en una subclase ni accedas a ellos desde un thumbnail service; esos ejemplos no compilan o no modifican el flujo interno.

### Validación propia

Validá el usuario y el archivo en el endpoint o servicio de negocio autenticado **antes** de llamar a `MediaService.upload()`. El core valida tipo y tamaño según Settings; reglas de negocio como "solo usuarios premium" y permisos de la ruta pertenecen al cliente.

### Resize on-demand

Si necesitás thumbnails, implementá un servicio independiente: obtené la metadata con la identidad autenticada, resolvé el archivo bajo `MEDIA_UPLOAD_PATH`, verificá que la ruta física permanezca dentro del directorio público y limitá dimensiones/carga antes de llamar a Sharp. No hay generación automática de thumbnails ni un método del core listo para sobrescribir.

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

**Nota importante:** La URL de Media es una ruta pública relativa a la API (`/uploads/media/...`). Cualquiera puede obtener los bytes al solicitarla al origen de la API; en un frontend con otro origen, resolvé esa ruta contra el origen de la API. Los permisos aplican a las operaciones de gestión y metadata, no a la ruta estática.

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

Por defecto, Media usa `MEDIA_UPLOAD_PATH=uploads/media` y Files usa `FILES_UPLOAD_PATH=uploads/files`. `UPLOADS_PATH` ya no se admite porque compartía el directorio privado con la ruta pública. En producción:

### Opción 1: Filesystem local

```env
MEDIA_UPLOAD_PATH=uploads/media
FILES_UPLOAD_PATH=uploads/files
```

**No hace falta configurar nada adicional.** `CoreModule` ya sirve `uploads/media/` como carpeta estática via `ServeStaticModule`. La carpeta se sirve bajo el prefijo `/uploads/media/`.

Si usás un path personalizado, configurá `MEDIA_UPLOAD_PATH` para la escritura y el servidor estático. Si además declarás `modules.media.path`, debe apuntar al mismo directorio: su valor no configura por sí solo la escritura. La app rechaza una discrepancia al iniciar:

```typescript
CoreModule.registerAsync({
  // ...
  useFactory: (config: ConfigService) => ({
    database: { ... },
    auth: { ... },
    modules: {
      media: { storage: 'local', path: 'custom/media/path' }, // requiere MEDIA_UPLOAD_PATH=custom/media/path
    },
  }),
})
```

### Opción 2: S3 / Cloud Storage (no soportada por este módulo)

El módulo actual guarda imágenes en disco y genera URLs relativas bajo `/uploads/media/`. `modules.media.storage: 's3'` no cambia ese comportamiento y los métodos de almacenamiento/URL son privados; no hay una extensión S3 funcional mediante herencia. Si un cliente necesita S3, requiere una implementación independiente o una ampliación explícita del core antes de anunciarlo como compatible.

---

## Troubleshooting

### Error: "Configuración de media no encontrada"

Los settings `media.allowedMimetypes` y `media.maxFileSize` no existen en la tabla `settings`. Ejecutar seeds:

```bash
pnpm seed
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

`CoreModule` ya registra `ServeStaticModule` internamente y sirve `uploads/media/` bajo `/uploads/media/`. Si las imágenes no cargan, verificá:

1. Que el directorio físico exista y tenga los archivos (`uploads/media/` por defecto)
2. Que el frontend resuelva `media.url` (relativa, `/uploads/media/...`) contra el origen de la API y no contra el origen del frontend
3. Si usás un path personalizado, que `MEDIA_UPLOAD_PATH` y `modules.media.path` (si está definido) coincidan.

Si el path de la variable y el de `modules.media.path` no coinciden, la aplicación se detiene en lugar de servir un directorio distinto al de las imágenes subidas.

### Las dimensiones (width/height) son 0

Sharp no pudo leer los metadatos de la imagen. Posibles causas:

- La imagen está corrupta
- El formato no es compatible
- El buffer está vacío

Validar que `file.buffer` no esté vacío antes de llamar a `upload()`.

---

## Ejemplo completo: CRUD de imágenes de producto

Los métodos siguientes suponen que los endpoints que los llaman ya autenticaron al usuario y comprobaron `media.edit` o `media.delete` según la acción. Con `false`, las mutaciones del servicio quedan limitadas a las imágenes subidas por ese usuario; para administración de imágenes ajenas, comprobá el permiso correspondiente antes de pasar `true`.

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
    const media = await this.mediaService.update(productImage.mediaId, { alt }, userId, false);

    // Actualizar en ProductImage
    productImage.alt = alt;
    return this.productImageRepository.save(productImage);
  }

  async deleteImage(imageId: string, userId: string) {
    const productImage = await this.productImageRepository.findOneOrFail({
      where: { id: imageId },
    });

    // Eliminar de Media (archivo físico + registro)
    await this.mediaService.remove(productImage.mediaId, userId, false);

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
