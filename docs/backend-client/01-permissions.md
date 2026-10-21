# Permisos — Guía para proyectos cliente

Cómo registrar permisos propios, proteger endpoints y usar el sistema de autorización del core.

---

## Registrar permisos de un módulo

Cada módulo define y registra sus propios permisos en `onModuleInit`. `registerPermissions` los crea si no existen, pero **no los asigna automáticamente a ningún rol**. Después de registrarlos, asigná los permisos que necesite cada rol desde la administración; el usuario de sistema tiene bypass por `isSystemUser`, mientras que el rol `super_admin` necesita la asignación explícita.

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

> `registerPermissions` es **idempotente** — se puede llamar en cada arranque sin duplicar nada. Si el permiso ya existe y `moduleName` cambió, lo actualiza. No lo confundas con `seedPermissions`: ese seed asigna permisos del core a roles y debe ejecutarse antes de iniciar la app; no concede automáticamente permisos registrados posteriormente por módulos del cliente. **Al reejecutarlo, reemplaza las asignaciones de `super_admin`, `admin` y `user` con su lista de permisos del core**, por lo que debés prever cómo restaurar asignaciones personalizadas.

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
import { SessionAuthGuard, PermissionsGuard, RequirePermissions, CurrentUser } from '@dh/backend-core';

@Controller('products')
@UseGuards(SessionAuthGuard, PermissionsGuard)
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
@UseGuards(SessionAuthGuard)
getMyOrders(@CurrentUser() user: User) { ... }
```

---

## El usuario del sistema

El usuario del sistema (`isSystemUser: true`) **bypasea todos los permisos automáticamente**. No necesitás código especial — el `PermissionsGuard` del core lo maneja. Es una única identidad reservada, no un rol asignable. Para usuarios comunes, `POST /users` y `PATCH /users/:id` rechazan la asignación del rol `super_admin`, incluso si tiene el mismo peso que el del operador. Solo la cuenta de sistema puede asignarlo. Los otros roles base (`admin` y `user`) conservan su asignación habitual; `isProtected` controla su edición, no impide asignarlos.

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
