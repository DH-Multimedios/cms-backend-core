# Setup del proyecto cliente — Guía para backend

Cómo integrar `@dh/backend-core` en un proyecto NestJS cliente.

---

## Instalación

```bash
pnpm add git+ssh://git@github.com:DH-Multimedios/cms-backend-core.git
```

Agregar en `package.json` para permitir el build:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["@dh/backend-core"]
  }
}
```

---

## main.ts

El core usa cookies HttpOnly para auth. `cookie-parser` ya está aplicado globalmente por `CoreModule` — no hace falta agregarlo en `main.ts`.

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — requerido si el frontend está en otro dominio
  app.enableCors({
    origin: process.env.FRONTEND_URL, // ej: http://localhost:3001
    credentials: true, // ← requerido para que el browser envíe cookies
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> ⚠️ Sin `credentials: true` en CORS el browser no envía las cookies HttpOnly.

---

## AppModule

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from '@dh/backend-core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        database: {
          host: config.get('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get('DB_USER'),
          password: config.get('DB_PASS'),
          database: config.get('DB_NAME'),
        },
        auth: {
          cookiePath: '/auth', // default: '/auth'
          // cookieSecure y cookieSameSite tienen defaults según NODE_ENV:
          //   - dev:  sameSite='none', secure=true (para localhost cross-origin)
          //   - prod: sameSite='lax',  secure=true
        },
      }),
    }),
  ],
})
export class AppModule {}
```

---

## data-source.ts

```typescript
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { CORE_ENTITIES } from '@dh/backend-core';
import { Product } from './src/entities/product.entity';

dotenv.config();

const config = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.get('DB_HOST'),
  port: config.get<number>('DB_PORT'),
  username: config.get('DB_USER'),
  password: config.get('DB_PASS'),
  database: config.get('DB_NAME'),
  entities: [
    ...CORE_ENTITIES,
    // Tus entidades
    Product,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
```

---

## Variables de entorno requeridas

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=mi_usuario
DB_PASS=mi_password
DB_NAME=mi_base

# Usuario del sistema (backdoor del desarrollador — NO compartir)
SYSTEM_USER_EMAIL=system@internal.dev
SYSTEM_USER_PASSWORD=password-muy-seguro

# SuperAdmin del cliente
SUPERADMIN_EMAIL=superadmin@cliente.com
SUPERADMIN_PASSWORD=password-seguro

# Admin del cliente
ADMIN_EMAIL=support@cliente.com
ADMIN_PASSWORD=password-seguro

# Usuario normal del cliente (opcional)
USER_EMAIL=user@cliente.com
USER_PASSWORD=password-seguro

# Debug de requests (opcional — solo para desarrollo)
# Loguea method, path, query y body de cada request en la consola
# DEBUG_REQUESTS=true
```

---

## Seeds

El core provee `runCoreSeeds` que crea roles, permisos, usuarios y settings base. Llamarlo antes de tus seeds propios:

```typescript
// src/database/seeds/run-seed.ts
import { AppDataSource } from '../data-source';
import { runCoreSeeds } from '@dh/backend-core';
import { seedProducts } from './products.seeder';

async function runSeed() {
  await AppDataSource.initialize();

  await runCoreSeeds(AppDataSource); // Siempre primero

  await seedProducts(AppDataSource); // Tus seeds después
}

runSeed();
```

---

## Migraciones

Las migraciones del core NO se incluyen automáticamente. Correrlas una vez al configurar el proyecto:

```bash
# En el proyecto cliente, las migraciones del core deben estar presentes en tu data-source
# Incluí las migraciones del core + las tuyas en la misma carpeta, o usá un path glob

migrations: [
  'node_modules/@dh/backend-core/src/database/migrations/*.ts',
  'src/database/migrations/*.ts',
],
```

---

## Módulos importados automáticamente

Al registrar `CoreModule`, los siguientes módulos están disponibles para inyectar en toda la app (son `@Global`):

| Módulo                 | Servicios exportados                                      |
| ---------------------- | --------------------------------------------------------- |
| `ConfigModule`         | `ConfigService`                                           |
| `EventEmitterModule`   | `EventEmitter2`                                           |
| `AuthModule`           | `AuthService`, `SessionAuthGuard`, `PermissionsGuard`     |
| `UsersModule`          | `UsersService`                                            |
| `RolesModule`          | `RolesService`                                            |
| `PermissionsModule`    | `PermissionsService`                                      |
| `AuditModule`          | `AuditService`                                            |
| `SettingsModule`       | `SettingsService`                                         |
| `TaxonomiesModule`     | `TaxonomiesService`                                       |
| `FilesModule`          | `FilesService`                                            |
| `MediaModule`          | `MediaService`                                            |
| `EmailProvidersModule` | `EmailProvidersService`                                   |
| `NotificationsModule`  | `NotificationsService` ¹, `EmailSenderService` ², `NotificationTypesService` ² |
| `UserPreferencesModule`| `UserPreferencesService`, `BaseUserPreferencesService`    |

---

> ¹ Re-exportado en el barrel `@dh/backend-core` — importable directamente.
> ² Inyectable vía DI (el módulo lo exporta), pero **no re-exportado** en el barrel. Para tiparlo, importá `NotificationsModule` en tu módulo propio. Ver [notifications.md](./notifications.md).

---

## Decoradores disponibles

```typescript
import {
  Public, // Marca endpoint como público
  CurrentUser, // Inyecta el usuario autenticado
  RequirePermissions, // Valida permisos
  SessionAuthGuard,
  PermissionsGuard,
} from '@dh/backend-core';
```

### Ejemplo de endpoint protegido

```typescript
@Get()
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('products.read')
findAll() { ... }

@Post()
@Public()
publicEndpoint() { ... }

@Get('me')
@UseGuards(SessionAuthGuard)
getProfile(@CurrentUser() user: User) { ... }
```

---

## Tipos exportados

```typescript
import type {
  // Entidades
  User,
  Role,
  Permission,
  Session,
  AuditLog,
  Setting,
  SettingCategory,
  EmailProvider,
  EmailProviderType,
  EmailProviderConfigUnion,
  EmailLayout,
  EmailLayoutType,
  EmailTemplate,
  NotificationType,
  UserNotificationPreference,
  ThemePreference,
  UserPreference,
  // Bloques de email
  Section,
  Column,
  Block,
  TextBlock,
  HeadingBlock,
  ButtonBlock,
  ImageBlock,
  DividerBlock,
  SpacerBlock,
  // Interfaces
  PaginatedResult,
  ApiResponse,
  CoreSeedOptions,
  ExtraRole,
} from '@dh/backend-core';

// Valores y funciones (no types)
import {
  CORE_ENTITIES,
  runCoreSeeds,
  generateSlug,
  ApiException,
  ErrorCode,
} from '@dh/backend-core';
```
