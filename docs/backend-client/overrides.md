# Overrides y extensiones — Guía para proyectos cliente

Cómo personalizar, extender y sobreescribir comportamientos del core desde un proyecto cliente.

---

## Extender entidades del core

TypeORM no soporta herencia de entidades de forma directa para proyectos externos. La forma correcta de extender es con **relaciones 1-a-1** o **columnas adicionales en tablas propias**.

### Ejemplo: agregar datos de perfil al usuario

El campo `avatarUrl` ya está incluido en el core. Si necesitás datos adicionales (bio, teléfono, etc.), creá una relación 1-a-1:

```typescript
// src/entities/user-profile.entity.ts (en tu proyecto cliente)
@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  phone: string;
}
```

---

## Agregar permisos propios

Cada módulo del cliente puede registrar sus propios permisos en `onModuleInit`. `registerPermissions` los crea si no existen, **pero no los asigna a ningún rol**. Asignalos explícitamente al rol que corresponda desde la administración de permisos; no supongas que el SuperAdmin los recibe al registrarlos:

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

Proteger endpoints con el permiso:

```typescript
@Get()
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('products.read')
findAll() { ... }
```

---

## Agregar settings propios

En tu seeder, creá categorías y settings específicos de tu proyecto:

```typescript
import { DataSource } from 'typeorm';
import { SettingCategory, Setting } from '@dh/backend-core';

export async function seedClientSettings(dataSource: DataSource) {
  const categoryRepo = dataSource.getRepository(SettingCategory);
  const settingRepo = dataSource.getRepository(Setting);

  // Categoría propia
  let category = await categoryRepo.findOneBy({ slug: 'ecommerce' });
  if (!category) {
    category = await categoryRepo.save(
      categoryRepo.create({ slug: 'ecommerce', label: 'E-commerce', order: 10 }),
    );
  }

  // Setting propio
  const existing = await settingRepo.findOneBy({ key: 'store.currency' });
  if (!existing) {
    await settingRepo.save(
      settingRepo.create({
        categoryId: category.id,
        key: 'store.currency',
        label: 'Moneda',
        value: 'ARS',
        type: 'string',
        inputType: 'select',
        meta: {
          options: [
            { value: 'ARS', label: 'Peso argentino' },
            { value: 'USD', label: 'Dólar' },
          ],
        },
        order: 1,
      }),
    );
  }
}
```

---

## Agregar taxonomías propias

Las taxonomías se distinguen por `type`. Definí tus propios tipos en tu proyecto:

```typescript
// Crear taxonomías del tipo 'product-category'
POST /taxonomies
{
  "name": "Electrónica",
  "type": "product-category",
  "description": "Productos electrónicos"
}

// Consultar por tipo
GET /taxonomies?type=product-category
```

No necesitás modificar el core — el campo `type` es libre.

---

## Escuchar eventos del core en tu módulo

Podés suscribirte a cualquier evento que emita el core:

```typescript
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '@dh/backend-core';

@Injectable()
export class CrmSyncService {
  @OnEvent('user.created')
  async syncTocrm(event: UserCreatedEvent) {
    // Sincronizar el usuario nuevo con tu CRM
    await this.crmClient.createContact(event.user);
  }
}
```

---

## Sobreescribir el guard de permisos

Para autorización por tenant, conservá los guards del core en el endpoint y agregá un guard del cliente que implemente `CanActivate`. `PermissionsGuard.canActivate()` es síncrono (`boolean`): no lo sobrescribas con `async canActivate(): Promise<boolean>`, porque esa subclase no compila. El cliente debe definir su comprobación de pertenencia y cargarla desde una fuente confiable; no uses un tenant ID del request como prueba de acceso.

```typescript
@UseGuards(SessionAuthGuard, PermissionsGuard, TenantGuard)
@RequirePermissions('products.read')
@Get(':id')
findOne(@Param('id') id: string) { /* ... */ }
```

No registres un guard de tenant como `APP_GUARD` sin contemplar las rutas públicas y la sesión. Esta guía no implementa una política de tenants: su lógica pertenece al cliente.

---

## Agregar migraciones propias

En una **base nueva**, incluí las entidades y migraciones empaquetadas del core junto con las tuyas en el mismo `DataSource`. El core no corre migraciones automáticamente al importarlo; `synchronize: false` no crea el esquema y los seeds no sustituyen las migraciones. Usá el `DataSource` completo, los globs TS/JS y el orden de ejecución de [00-setup.md, sección 7](./00-setup.md#7-datasource-y-migraciones-typeorm-11). Solo agregá tus entidades después de `...CORE_ENTITIES` y tu propio glob de migraciones al ejemplo de esa sección.

En el ejemplo de setup, mantené `entities: [...CORE_ENTITIES, Product, Order, UserProfile]`, los dos globs de migraciones (core empaquetado y cliente TS/JS) y `synchronize: false`. No reemplaces el glob del core por `src/database/migrations/*.ts` del cliente.

En una **base existente**, no ejecutes el baseline consolidado sin revisar el historial aplicado; primero acordá una ruta de transición. Una vez aplicado el esquema del core, creá migraciones para tus nuevas entidades o columnas.

---

## Runseeds del cliente

En tu `run-seed.ts`, ejecutá primero los seeds del core y luego los tuyos:

```typescript
import { runCoreSeeds } from '@dh/backend-core';
import { seedProducts } from './products.seeder';
import { seedClientSettings } from './client-settings.seeder';

async function runSeed() {
  await AppDataSource.initialize();

  // Seeds del core (roles, permisos, usuarios, settings, notificaciones)
  await runCoreSeeds(AppDataSource);

  // Seeds propios del cliente
  await seedProducts(AppDataSource);
  await seedClientSettings(AppDataSource);
}
```

---

## Variables de entorno requeridas por el core

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_NAME=...

# Cuenta operacional altamente privilegiada (opcional; usar secret manager)
SYSTEM_USER_EMAIL=system@internal
SYSTEM_USER_PASSWORD=...

# SuperAdmin del cliente
SUPERADMIN_EMAIL=superadmin@cliente.com
SUPERADMIN_PASSWORD=...

# Admin del cliente
ADMIN_EMAIL=support@cliente.com
ADMIN_PASSWORD=...

# Usuario normal del cliente (opcional)
USER_EMAIL=user@cliente.com
USER_PASSWORD=...
```

> La duración de sesión se configura primariamente desde Settings (`auth.sessionExpiration`, en días, default `365`). También podés fijar un valor inicial via `AuthConfig.sessionExpiration` en `CoreModule.registerAsync` — ese valor se usa como fallback si el setting no existe, no como override en tiempo de ejecución.
