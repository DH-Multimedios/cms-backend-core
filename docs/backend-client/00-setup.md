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

El core usa cookies HttpOnly para auth. Hay que habilitar `cookie-parser` antes de arrancar la app:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // ← requerido para auth con cookies

  // CORS — requerido si el frontend está en otro dominio
  app.enableCors({
    origin: process.env.FRONTEND_URL, // ej: http://localhost:3001
    credentials: true, // ← requerido para que el browser envíe cookies
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

> ⚠️ Sin `credentials: true` en CORS el browser no envía las cookies HttpOnly. Sin `cookieParser()` el backend no las lee.

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
          jwtSecret: config.get('JWT_SECRET'),
          jwtExpiresIn: config.get('JWT_EXPIRATION', '15m'),
          jwtRefreshSecret: config.get('JWT_REFRESH_SECRET'),
          jwtRefreshExpiresIn: config.get('JWT_REFRESH_EXPIRATION', '7d'),
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

# JWT
JWT_SECRET=secreto-jwt-muy-largo-y-seguro
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=secreto-refresh-muy-largo-y-seguro
JWT_REFRESH_EXPIRATION=7d

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

| Módulo                 | Servicios exportados                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| `ConfigModule`         | `ConfigService`                                                          |
| `EventEmitterModule`   | `EventEmitter2`                                                          |
| `AuthModule`           | `AuthService`, `JwtAuthGuard`, `PermissionsGuard`                        |
| `UsersModule`          | `UsersService`                                                           |
| `RolesModule`          | `RolesService`                                                           |
| `PermissionsModule`    | `PermissionsService`                                                     |
| `AuditModule`          | `AuditService`                                                           |
| `SettingsModule`       | `SettingsService`                                                        |
| `EmailProvidersModule` | `EmailProvidersService`                                                  |
| `NotificationsModule`  | `NotificationsService`, `EmailSenderService`, `NotificationTypesService` |

---

## Decoradores disponibles

```typescript
import {
  Public, // Marca endpoint como público
  CurrentUser, // Inyecta el usuario autenticado
  RequirePermissions, // Valida permisos
  JwtAuthGuard,
  PermissionsGuard,
} from '@dh/backend-core';
```

### Ejemplo de endpoint protegido

```typescript
@Get()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('products.read')
findAll() { ... }

@Post()
@Public()
publicEndpoint() { ... }

@Get('me')
@UseGuards(JwtAuthGuard)
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
  RefreshToken,
  AuditLog,
  Setting,
  SettingCategory,
  SettingType,
  SettingInputType,
  SettingMeta,
  EmailProvider,
  EmailProviderType,
  EmailProviderConfigUnion,
  EmailLayout,
  EmailLayoutType,
  EmailTemplate,
  NotificationType,
  UserNotificationPreference,
  // Bloques
  Section,
  Column,
  Block,
  TextBlock,
  HeadingBlock,
  ButtonBlock,
  ImageBlock,
  DividerBlock,
  SpacerBlock,
  // Entidades del cliente
  CORE_ENTITIES,
  // Seeds
  runCoreSeeds,
} from '@dh/backend-core';
```
