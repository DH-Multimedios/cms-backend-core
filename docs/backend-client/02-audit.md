# Auditoría — Guía para proyectos cliente

Cómo usar el `AuditService` del core para registrar acciones en módulos propios.

---

## Uso básico

El `AuditService` está disponible globalmente — inyectarlo directamente:

```typescript
import { Injectable } from '@nestjs/common';
import { AuditService } from '@dh/backend-core';

@Injectable()
export class ProductsService {
  constructor(private readonly auditService: AuditService) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = await this.repository.save(dto);

    await this.auditService.log({
      action: 'create',
      entity: 'Product',
      entityId: product.id,
      metadata: {
        after: { name: product.name, price: product.price },
      },
    });

    return product;
  }
}
```

---

## Estructura de AuditOptions

```typescript
{
  action: string,        // 'create', 'update', 'delete', 'export', 'activate'...
  entity: string,        // 'Product', 'Order', 'Invoice'...
  entityId?: string,     // ID del registro afectado
  metadata?: {
    before?: Record,     // Estado anterior (para updates/deletes)
    after?: Record,      // Estado nuevo (para creates/updates)
    reason?: string,     // Motivo (opcional)
    [key: string]: any,  // Cualquier dato adicional
  },
  userId?: string,       // Override — por defecto usa el usuario del contexto (CLS)
}
```

---

## Captura automática de contexto

El `AuditContextInterceptor` captura automáticamente IP y User-Agent de cada request y los almacena en el contexto CLS. El `AuditService` los recupera sin que vos hagas nada:

```typescript
// Esto es suficiente — ip y userAgent se capturan solos
await this.auditService.log({
  action: 'delete',
  entity: 'Product',
  entityId: id,
  metadata: { before: { name: product.name } },
});
```

---

## Ejemplo completo con before/after

```typescript
async update(id: string, dto: UpdateProductDto): Promise<Product> {
  const product = await this.repository.findOneBy({ id });

  const before = {
    name: product.name,
    price: product.price,
    isActive: product.isActive,
  };

  Object.assign(product, dto);
  const saved = await this.repository.save(product);

  await this.auditService.log({
    action: 'update',
    entity: 'Product',
    entityId: id,
    metadata: {
      before,
      after: { name: saved.name, price: saved.price, isActive: saved.isActive },
    },
  });

  return saved;
}
```

---

## Acciones sugeridas (convención)

| Acción | Cuándo |
|--------|--------|
| `create` | Creación de un registro |
| `update` | Modificación de un registro |
| `delete` | Eliminación de un registro |
| `activate` | Activación de un recurso |
| `deactivate` | Desactivación de un recurso |
| `export` | Exportación de datos |
| `import` | Importación masiva |
| `assign` | Asignación de relaciones |

---

## Acceder a los logs

Los logs se consultan desde `GET /audit` con filtros por `entity`, `action`, `userId`, etc. Ver [docs/frontend/audit.md](../frontend/audit.md).
