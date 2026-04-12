# Taxonomies — Guía para proyectos cliente

Cómo usar el módulo de taxonomías para clasificar entidades de negocio (categorías, tags, secciones).

---

## Concepto

Las taxonomías son genéricas — se diferencian por el campo `type` (string libre). El core no define tipos, cada proyecto crea los suyos.

La asociación con entidades de negocio se hace vía tabla pivot `EntityTaxonomy` (polimórfica: `entityType` + `entityId`).

---

## Inyectar el servicio

```typescript
import { Injectable } from '@nestjs/common';
import { TaxonomiesService } from '@dh/backend-core';

@Injectable()
export class ProductsService {
  constructor(private readonly taxonomiesService: TaxonomiesService) {}
}
```

---

## API del TaxonomiesService

### `findAll(query)`

Lista taxonomías con filtros y paginación.

```typescript
const categories = await this.taxonomiesService.findAll({
  type: 'product-category',
  root: 'true', // Solo raíces (sin parentId)
  page: 1,
  limit: 50,
});
```

### `findOne(id)`

Obtiene una taxonomía con `childrenCount`.

```typescript
const category = await this.taxonomiesService.findOne(categoryId);
```

### `create(dto)`

Crea una taxonomía. El slug se auto-genera si no se envía.

```typescript
const category = await this.taxonomiesService.create({
  name: 'Electrónica',
  type: 'product-category',
  description: 'Productos electrónicos',
  parentId: parentCategoryId, // opcional
});
```

### `update(id, dto)`

Actualiza campos. Si se cambia `name` sin enviar `slug`, el slug se regenera.

```typescript
await this.taxonomiesService.update(id, { name: 'Electrónica y Gadgets' });
```

### `remove(id)`

Elimina una taxonomía. Falla si tiene hijos (`TAXONOMY_HAS_CHILDREN`).

```typescript
await this.taxonomiesService.remove(id);
```

### `reorder(dto)`

Reordena taxonomías del mismo nivel.

```typescript
await this.taxonomiesService.reorder({ ids: ['uuid-3', 'uuid-1', 'uuid-2'] });
```

---

## Asociar taxonomías a entidades

### `syncEntity(entityType, entityId, taxonomyIds)`

Reemplaza completamente las taxonomías asociadas a una entidad. Idempotente.

```typescript
async updateProduct(id: string, dto: UpdateProductDto) {
  const product = await this.productRepo.save({ ...dto, id });

  // Sincronizar categorías del producto
  if (dto.categoryIds) {
    await this.taxonomiesService.syncEntity('Product', id, dto.categoryIds);
  }

  return product;
}
```

### `findForEntity(entityType, entityId)`

Devuelve las taxonomías asociadas a una entidad.

```typescript
async getProductWithCategories(id: string) {
  const product = await this.productRepo.findOneBy({ id });
  const categories = await this.taxonomiesService.findForEntity('Product', id);

  return { ...product, categories };
}
```

### `detachAllFromEntity(entityType, entityId)`

Elimina todas las asociaciones. Llamar al eliminar la entidad.

```typescript
async deleteProduct(id: string) {
  await this.taxonomiesService.detachAllFromEntity('Product', id);
  await this.productRepo.delete(id);
}
```

---

## Registrar permisos propios

Los permisos de taxonomías (`taxonomies.create`, `taxonomies.update`, `taxonomies.delete`) se registran automáticamente desde el core. No necesitás registrarlos.

---

## Seedear taxonomías del cliente

```typescript
import { DataSource } from 'typeorm';
import { Taxonomy } from '@dh/backend-core';
import { generateSlug } from '@dh/backend-core';

export async function seedProductCategories(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Taxonomy);

  const defaults = [
    { name: 'Electrónica', type: 'product-category', order: 0 },
    { name: 'Ropa', type: 'product-category', order: 1 },
    { name: 'Hogar', type: 'product-category', order: 2 },
  ];

  for (const def of defaults) {
    const slug = generateSlug(def.name);
    const existing = await repo.findOneBy({ slug });
    if (!existing) {
      await repo.save(repo.create({ ...def, slug }));
      console.log(`  ✓ Taxonomía creada: ${def.name}`);
    }
  }
}
```

---

## Convención de `entityType`

Usar PascalCase consistente con el nombre de la entidad TypeORM:

```
Product    → 'Product'
BlogPost   → 'BlogPost'
User       → 'User'
```

---

## Jerarquía (parent-child)

Las taxonomías soportan anidación. Al crear una taxonomía hija, enviar `parentId`:

```typescript
const parent = await this.taxonomiesService.create({
  name: 'Electrónica',
  type: 'product-category',
});

const child = await this.taxonomiesService.create({
  name: 'Smartphones',
  type: 'product-category',
  parentId: parent.id,
});
```

El servicio valida:

- Que el padre exista
- Que no se auto-referencie
- Que no se elimine un padre con hijos

---

## Errores específicos

| code                      | HTTP | Cuándo                                   |
| ------------------------- | ---- | ---------------------------------------- |
| `TAXONOMY_NOT_FOUND`      | 404  | Taxonomía o padre no encontrado          |
| `TAXONOMY_SLUG_EXISTS`    | 409  | El slug ya está en uso                   |
| `TAXONOMY_INVALID_PARENT` | 400  | Se intentó asignar como padre a sí misma |
| `TAXONOMY_HAS_CHILDREN`   | 409  | Tiene hijos — no se puede eliminar       |

---

## Auditoría

El módulo audita automáticamente `create`, `update` y `delete` con metadata (name, slug, type). No necesitás auditar manualmente.
