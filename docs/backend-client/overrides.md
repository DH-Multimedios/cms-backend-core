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

Cada módulo del cliente puede registrar sus propios permisos en `onModuleInit`. El sistema los crea si no existen y los asigna al SuperAdmin:

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

Si necesitás lógica de autorización personalizada (ej: multi-tenant), podés reemplazar el guard:

```typescript
// src/guards/tenant-permissions.guard.ts
import { PermissionsGuard } from '@dh/backend-core';

@Injectable()
export class TenantPermissionsGuard extends PermissionsGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const baseResult = await super.canActivate(context);
    if (!baseResult) return false;

    // Tu lógica adicional
    const user = context.switchToHttp().getRequest().user;
    return this.checkTenantAccess(user);
  }
}
```

Registralo globalmente en tu `AppModule`:

```typescript
{ provide: APP_GUARD, useClass: TenantPermissionsGuard }
```

---

## Agregar migraciones propias

En tu `data-source.ts`, incluí las entidades y migraciones del core más las tuyas:

```typescript
import { CORE_ENTITIES } from '@dh/backend-core';

export const AppDataSource = new DataSource({
  // ...
  entities: [...CORE_ENTITIES, Product, Order, UserProfile],
  migrations: ['src/database/migrations/*.ts'],
});
```

Las migraciones del core ya corrieron. Solo creás migraciones para tus entidades propias.

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
DB_USER=...
DB_PASS=...
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
