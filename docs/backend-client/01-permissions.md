# Permisos — Guía para proyectos cliente

Cómo registrar permisos propios, proteger endpoints y usar el sistema de autorización del core.

---

## Registrar permisos de un módulo

Cada módulo define y registra sus propios permisos en `onModuleInit`. El sistema los crea si no existen y los asigna automáticamente al SuperAdmin.

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionsService } from '@dh/backend-core';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(private readonly permissionsService: PermissionsService) {}

  async onModuleInit() {
    await this.permissionsService.registerPermissions([
      {
        name: 'products.read',
        description: 'Ver productos',
        module: 'products',
        moduleName: 'Productos',
      },
      {
        name: 'products.create',
        description: 'Crear productos',
        module: 'products',
        moduleName: 'Productos',
      },
      {
        name: 'products.update',
        description: 'Editar productos',
        module: 'products',
        moduleName: 'Productos',
      },
      {
        name: 'products.delete',
        description: 'Eliminar productos',
        module: 'products',
        moduleName: 'Productos',
      },
    ]);
  }
}
```

> `registerPermissions` es **idempotente** — se puede llamar en cada arranque sin duplicar nada. Si el permiso ya existe y `moduleName` cambió, lo actualiza.

---

## Convención de nombres

```
{módulo}.{acción}
```

Ejemplos:

- `products.read`
- `orders.create`
- `invoices.export`
- `reports.view`

---

## Proteger endpoints

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard, RequirePermissions } from '@dh/backend-core';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  @Get()
  @RequirePermissions('products.read')
  findAll() { ... }

  @Post()
  @RequirePermissions('products.create')
  create() { ... }

  @Patch(':id')
  @RequirePermissions('products.update')
  update() { ... }

  @Delete(':id')
  @RequirePermissions('products.delete')
  remove() { ... }
}
```

---

## Endpoints de solo usuario autenticado (sin permiso específico)

Para rutas que solo requieren estar logueado (sin permiso):

```typescript
@Get('me/orders')
@UseGuards(JwtAuthGuard)
getMyOrders(@CurrentUser() user: User) { ... }
```

---

## El usuario del sistema

El usuario del sistema (`isSystemUser: true`) **bypasea todos los permisos automáticamente**. No necesitás código especial — el `PermissionsGuard` del core lo maneja.

---

## Verificar permisos manualmente en código

Si necesitás verificar permisos en lógica de negocio (no en guard):

```typescript
import { ForbiddenException } from '@nestjs/common';
import { CurrentUser } from '@dh/backend-core';

async deleteProduct(id: string, currentUser: User) {
  const hasPermission = currentUser.roles.some(role =>
    role.permissions.some(p => p.name === 'products.delete')
  );

  if (!currentUser.isSystemUser && !hasPermission) {
    throw new ForbiddenException();
  }

  // ...
}
```

---

## Asignar permisos a roles desde UI

Los permisos registrados aparecen automáticamente en los endpoints:

```
GET /permissions/list
```

Retorna todos los permisos sin paginación, con `module` (key para agrupar) y `moduleName` (label legible en español):

```json
[
  {
    "id": "uuid",
    "name": "products.read",
    "description": "Ver productos",
    "module": "products",
    "moduleName": "Productos"
  },
  {
    "id": "uuid",
    "name": "products.create",
    "description": "Crear productos",
    "module": "products",
    "moduleName": "Productos"
  }
]
```

También podés filtrar por módulo con el endpoint paginado:

```
GET /permissions?module=products
```

El frontend usa `/permissions/list` para construir el panel de asignación de permisos por rol, agrupando por `moduleName`.

---

## Asignar permisos incrementalmente

Para prender/apagar permisos individuales (switches/toggles en la UI):

```
PATCH /roles/:id/permissions
```

```json
{
  "add": ["uuid-perm-1"],
  "remove": ["uuid-perm-2"]
}
```

Para reemplazar todos los permisos de un golpe (bulk replace):

```
POST /roles/:id/permissions
```

```json
{
  "permissionIds": ["uuid-perm-1", "uuid-perm-2", "uuid-perm-3"]
}
```
