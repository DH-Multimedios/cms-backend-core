# Setup del proyecto cliente

Guía paso a paso para crear un proyecto NestJS nuevo usando `@dh/backend-core`.

---

## Requisitos previos

- Node.js >= 20
- pnpm
- Podman + podman-compose
- NestJS CLI (`pnpm add -g @nestjs/cli`)

---

## Paso 1 — Crear el proyecto NestJS

```bash
nest new mi-proyecto
cd mi-proyecto
```

Cuando pregunte el package manager, elegí **pnpm**.

---

## Paso 2 — Instalar el core y dependencias

```bash
# Core
pnpm add git+ssh://git@github.com:DH-Multimedios/cms-backend-core.git

# Dependencias adicionales
pnpm add @nestjs/config @nestjs/swagger dotenv

# TypeORM
pnpm add @nestjs/typeorm typeorm pg
```

### pnpm 11 — aprobar build scripts

pnpm 11 bloquea por seguridad los scripts de build de dependencias transitivas. El core trae paquetes como `@nestjs/core`, `bcrypt` y `sharp` que necesitan correr scripts al instalarse.

Ejecutá una vez después de instalar:

```bash
pnpm approve-builds
```

Seleccioná todos los paquetes de la lista. pnpm guarda la aprobación en `pnpm-workspace.yaml` y no vuelve a preguntar.

---

## Paso 3 — AppModule

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
          host: config.getOrThrow<string>('DB_HOST'),
          port: config.getOrThrow<number>('DB_PORT'),
          username: config.getOrThrow<string>('DB_USERNAME'),
          password: config.getOrThrow<string>('DB_PASSWORD'),
          database: config.getOrThrow<string>('DB_NAME'),
          synchronize: false,
          logging: config.get('DB_LOGGING') === 'true',
        },
        auth: {
          sessionExpiration: config.get('SESSION_EXPIRATION') || '365',
          cookiePath: '/',
        },
        modules: {
          audit: true,
          health: true,
          taxonomies: true,
          settings: true,
          files: {
            storage: 'local',
            path: './uploads/files',
          },
          media: {
            storage: 'local',
            path: './uploads/media',
          },
        },
      }),
    }),

    // Tus módulos de negocio acá
    // ProductsModule,
  ],
})
export class AppModule {}
```

> `getOrThrow()` lanza un error claro si falta la variable de entorno — mejor que un `undefined` silencioso en runtime.

---

## Paso 4 — main.ts

El core aplica `cookie-parser` globalmente — no hace falta agregarlo acá.

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(','),
    credentials: true, // requerido para que el browser envíe cookies HttpOnly
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Mi Proyecto API')
    .setDescription('Descripción de la API')
    .setVersion('1.0.0')
    .addCookieAuth('session_id')
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 http://localhost:${process.env.PORT || 3000}`);
  console.log(`📚 http://localhost:${process.env.PORT || 3000}/api/docs`);
}

bootstrap();
```

> ⚠️ Sin `credentials: true` en CORS el browser no envía las cookies HttpOnly.

---

## Paso 5 — Variables de entorno

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=mi_proyecto
DB_PASSWORD=mi_password
DB_NAME=mi_proyecto_dev
DB_LOGGING=false

# Auth
SESSION_EXPIRATION=365

# CORS
CORS_ORIGINS=http://localhost:4200

# Usuario del sistema (backdoor del desarrollador — NO compartir)
SYSTEM_USER_EMAIL=tu-email@personal.com
SYSTEM_USER_PASSWORD=password-ultra-segura

# SuperAdmin del cliente
SUPERADMIN_EMAIL=admin@miproyecto.com
SUPERADMIN_PASSWORD=password-segura

# Admin del cliente
ADMIN_EMAIL=support@miproyecto.com
ADMIN_PASSWORD=password-segura
```

---

## Paso 6 — Podman

```yaml
services:
  postgres:
    image: docker.io/library/postgres:18
    container_name: mi-proyecto-postgres
    restart: unless-stopped

    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}

    ports:
      - '${DB_PORT:-5432}:5432'

    volumes:
      - mi_proyecto_data:/var/lib/postgresql:Z

    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USERNAME}']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  mi_proyecto_data:
```

> Usá un nombre de container único por proyecto para evitar conflictos cuando corrés varios proyectos a la vez.

---

## Paso 7 — data-source.ts

```typescript
import { DataSource } from 'typeorm';
import 'dotenv/config'; // necesario: este archivo corre via CLI, fuera del contexto de NestJS

import { CORE_ENTITIES } from '@dh/backend-core';
// import { Product } from './entities/product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [
    ...CORE_ENTITIES,
    // Product,
  ],
  migrations: [
    'node_modules/@dh/backend-core/dist/database/migrations/*.js', // migraciones del core
    'src/database/migrations/*.ts', // tus migraciones
  ],
  synchronize: false,
  logging: false,
});
```

Scripts en `package.json`:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "pnpm typeorm migration:generate -d src/database/data-source.ts",
    "migration:run": "pnpm typeorm migration:run -d src/database/data-source.ts",
    "migration:revert": "pnpm typeorm migration:revert -d src/database/data-source.ts",
    "seed": "ts-node src/database/seeds/run-seed.ts"
  }
}
```

---

## Paso 8 — Seeds

```typescript
// src/database/seeds/run-seed.ts
import { AppDataSource } from '../data-source';
import { runCoreSeeds } from '@dh/backend-core';

async function runSeed() {
  await AppDataSource.initialize();

  await runCoreSeeds(AppDataSource); // siempre primero

  // await seedProducts(AppDataSource); // tus seeds después

  await AppDataSource.destroy();
}

void runSeed();
```

---

## Paso 9 — Primera ejecución

```bash
# 1. Levantar la base de datos
podman-compose up -d

# 2. Correr migraciones
pnpm migration:run

# 3. Correr seeds
pnpm seed

# 4. Iniciar la app
pnpm start:dev
```

Verificar:

```bash
curl http://localhost:3000/api/health
# http://localhost:3000/api/docs
```

---

## Usuarios disponibles tras el seed

| Usuario    | Variable en .env       | Rol        |
|------------|------------------------|------------|
| Sistema    | `SYSTEM_USER_EMAIL`    | —          |
| SuperAdmin | `SUPERADMIN_EMAIL`     | SuperAdmin |
| Admin      | `ADMIN_EMAIL`          | Admin      |

> El usuario Sistema es invisible para todos — es el backdoor del desarrollador.

---

## Estructura recomendada

```
mi-proyecto/
├── src/
│   ├── modules/
│   │   └── products/
│   │       ├── entities/
│   │       ├── dto/
│   │       ├── products.controller.ts
│   │       ├── products.service.ts
│   │       └── products.module.ts
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── data-source.ts
│   ├── app.module.ts
│   └── main.ts
├── podman-compose.yml
├── .env
├── .env.example
└── package.json
```

---

## Módulos disponibles via DI

Al registrar `CoreModule` todos estos servicios son inyectables en tu app:

| Módulo                  | Servicios exportados                                                            |
|-------------------------|---------------------------------------------------------------------------------|
| `AuthModule`            | `AuthService`, `SessionAuthGuard`, `PermissionsGuard`                           |
| `UsersModule`           | `UsersService`                                                                  |
| `RolesModule`           | `RolesService`                                                                  |
| `PermissionsModule`     | `PermissionsService`                                                            |
| `AuditModule`           | `AuditService`                                                                  |
| `SettingsModule`        | `SettingsService`                                                               |
| `TaxonomiesModule`      | `TaxonomiesService`                                                             |
| `FilesModule`           | `FilesService`                                                                  |
| `MediaModule`           | `MediaService`                                                                  |
| `EmailProvidersModule`  | `EmailProvidersService`                                                         |
| `NotificationsModule`   | `NotificationsService`, `EmailSenderService`¹, `NotificationTypesService`¹      |
| `UserPreferencesModule` | `UserPreferencesService`, `BaseUserPreferencesService`                          |

> ¹ Inyectable vía DI pero no re-exportado en el barrel. Ver [notifications.md](./notifications.md).

---

## Decoradores disponibles

```typescript
import {
  Public,              // endpoint público (sin auth)
  CurrentUser,         // inyecta el usuario autenticado
  RequirePermissions,  // valida permisos
  SessionAuthGuard,
  PermissionsGuard,
} from '@dh/backend-core';
```

```typescript
@Get()
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('products.read')
findAll() { ... }

@Post('public')
@Public()
publicEndpoint() { ... }

@Get('me')
@UseGuards(SessionAuthGuard)
getProfile(@CurrentUser() user: User) { ... }
```

---

## Skill para agentes de IA

El core incluye un skill oficial que le enseña a cualquier agente (OpenCode, Claude, Cursor, etc.) los contratos, extension points y restricciones de `@dh/backend-core`. Sin él, el agente desconoce las reglas y puede generar código que las viola.

### Instalación inicial (una vez por proyecto)

```bash
mkdir -p skills/backend-core
cp node_modules/@dh/backend-core/skills/backend-core/SKILL.md skills/backend-core/SKILL.md
```

Registralo en `opencode.json` de tu proyecto:

```json
{
  "skills": [
    "skills/backend-core/SKILL.md"
  ]
}
```

> Commiteá `skills/backend-core/SKILL.md` en tu repo. Es parte de la configuración del proyecto, igual que `.eslintrc` o `tsconfig.json`.

### Mantenerlo actualizado

Cuando actualizás el core, comparé tu copia local contra la nueva versión:

```bash
diff skills/backend-core/SKILL.md node_modules/@dh/backend-core/skills/backend-core/SKILL.md
```

Mergeá los cambios relevantes a mano. Si el proyecto tiene convenciones propias encima del core, agregálas al final de tu copia local — el skill base actúa como capa base, tu overlay como capa propia.

---

## Actualizar el core

```bash
pnpm update @dh/backend-core
pnpm migration:run
pnpm start:dev
```

Si `pnpm update` no refleja los cambios:

```bash
pnpm remove @dh/backend-core
pnpm add git+ssh://git@github.com:DH-Multimedios/cms-backend-core.git
pnpm migration:run
```
