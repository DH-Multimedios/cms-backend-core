# Setup de proyecto cliente

Guía paso a paso para crear un proyecto nuevo usando `@dh/backend-core`.

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
# Instalar el core desde GitHub
pnpm add git+ssh://git@github.com:DH-Multimedios/cms-backend-core.git

# Permitir que pnpm ejecute el build del core al instalar
# Agregar en package.json del cliente:
# "pnpm": { "onlyBuiltDependencies": ["@dh/backend-core"] }

# Dependencias adicionales
pnpm add @nestjs/config @nestjs/swagger dotenv

# TypeORM (para migraciones y conexión a DB)
pnpm add @nestjs/typeorm typeorm pg
```

---

## Paso 3 — Configurar el AppModule

Reemplazá el contenido de `src/app.module.ts`:

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
          jwtSecret: config.getOrThrow<string>('JWT_SECRET'),
          jwtExpiration: config.get('JWT_EXPIRATION') || '1d',
          jwtRefreshSecret: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          jwtRefreshExpiration: config.get('JWT_REFRESH_EXPIRATION') || '7d',
          cookiePath: '/api/auth/refresh', // ⚠️ DEBE incluir el API prefix
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
    // OrdersModule,
  ],
})
export class AppModule {}
```

> `config.getOrThrow()` lanza un error claro si falta la variable de entorno — mejor que `undefined` silencioso en runtime.

---

## Paso 4 — Actualizar main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*', // ⚠️ Nunca usar '*' con credentials:true — siempre configurar CORS_ORIGINS en .env
    credentials: true,
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
    .addBearerAuth()
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 http://localhost:${process.env.PORT || 3000}`);
  console.log(`📚 http://localhost:${process.env.PORT || 3000}/api/docs`);
}

bootstrap();
```

---

## Paso 5 — Crear el .env

Creá `.env` en la raíz del proyecto:

```bash
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
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT
JWT_SECRET=secret-seguro-cambiar-en-produccion
JWT_EXPIRATION=1d
JWT_REFRESH_SECRET=refresh-secret-seguro
JWT_REFRESH_EXPIRATION=7d

# Usuarios iniciales
SYSTEM_USER_EMAIL=tu-email@personal.com
SYSTEM_USER_PASSWORD=password-ultra-segura

SUPERADMIN_EMAIL=admin@miproyecto.com
SUPERADMIN_PASSWORD=password-segura

ADMIN_EMAIL=support@miproyecto.com
ADMIN_PASSWORD=password-segura

# CORS
CORS_ORIGINS=http://localhost:4200
```

---

## Paso 6 — Crear podman-compose.yml

```yaml
services:
  postgres:
    image: docker.io/library/postgres:18
    container_name: mi-cleinte-postgres
    restart: unless-stopped

    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}

    ports:
      - '${DB_PORT:-5432}:5432'

    volumes:
      - mi_cliente_data:/var/lib/postgresql:Z

    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USERNAME}']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  mi_cliente_data:
```

> Usá un nombre de container diferente por proyecto (`mi-proyecto-postgres`) para evitar conflictos cuando corrés varios proyectos a la vez.

---

## Paso 7 — Configurar migraciones

Creá `src/database/data-source.ts`:

```typescript
import { DataSource } from 'typeorm';
import 'dotenv/config'; // Necesario acá: este archivo corre via CLI, fuera del contexto de NestJS

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
    // Product, // Tus entidades
  ],
  migrations: [
    'node_modules/@dh/backend-core/dist/database/migrations/*.js', // Migraciones del core
    'src/database/migrations/*.ts', // Tus migraciones
  ],
  synchronize: false,
  logging: false,
});
```

Agregá los scripts en `package.json`:

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

## Paso 8 — Crear seeds

Creá `src/database/seeds/run-seed.ts`:

```typescript
import { AppDataSource } from '../data-source';

// Importar el seed runner del core
// El core ya incluye seeds para roles, permisos y usuarios base
import { runCoreSeeds } from '@dh/backend-core';

async function runSeed() {
  await AppDataSource.initialize();
  console.log('✅ Conexión establecida');

  // Seeds del core (roles, permisos, usuarios)
  await runCoreSeeds(AppDataSource);

  // Tus seeds de negocio acá
  // await seedProducts(AppDataSource);

  await AppDataSource.destroy();
  console.log('✅ Seeds completados');
}

void runSeed();
```

---

## Paso 9 — Primera ejecución

```bash
# 1. Levantar la base de datos
podman-compose up -d

# 2. Esperar que PostgreSQL esté listo
sleep 3

# 3. Correr migraciones
pnpm migration:run

# 4. Correr seeds (crea roles, permisos y usuarios)
pnpm seed

# 5. Iniciar la app
pnpm start:dev
```

---

## Paso 10 — Verificar que todo funciona

```bash
# Health check
curl http://localhost:3000/api/health
# → ¡OK Funcionando!

# Swagger
# http://localhost:3000/api/docs
```

---

## Agregar tus propios módulos

### Crear un módulo de negocio

```bash
nest generate module modules/products
nest generate controller modules/products
nest generate service modules/products
```

### Registrar permisos del módulo

```typescript
// src/modules/products/products.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { PermissionService } from '@dh/backend-core';

@Module({})
export class ProductsModule implements OnModuleInit {
  constructor(private readonly permissionService: PermissionService) {}

  async onModuleInit() {
    await this.permissionService.registerPermissions([
      { name: 'products.read', description: 'Ver productos', module: 'products' },
      { name: 'products.create', description: 'Crear productos', module: 'products' },
      { name: 'products.update', description: 'Actualizar productos', module: 'products' },
      { name: 'products.delete', description: 'Eliminar productos', module: 'products' },
    ]);
  }
}
```

### Proteger endpoints

```typescript
// src/modules/products/products.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, PermissionsGuard, RequirePermissions, CurrentUser } from '@dh/backend-core';

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  @Get()
  @RequirePermissions('products.read')
  findAll(@CurrentUser() user) {
    return [];
  }
}
```

### Relacionar entidades con el core

```typescript
// src/modules/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@dh/backend-core';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;
}
```

---

## Usuarios disponibles tras el seed

| Usuario    | Email                        | Rol        | Acceso             |
| ---------- | ---------------------------- | ---------- | ------------------ |
| Sistema    | `SYSTEM_USER_EMAIL` del .env | -          | Total, invisible   |
| SuperAdmin | `SUPERADMIN_EMAIL` del .env  | SuperAdmin | Todos los permisos |
| Admin      | `ADMIN_EMAIL` del .env       | Admin      | Permisos limitados |

---

## Estructura recomendada del proyecto cliente

```
mi-proyecto/
├── src/
│   ├── modules/
│   │   ├── products/
│   │   │   ├── entities/
│   │   │   ├── dto/
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   └── products.module.ts
│   │   └── orders/
│   ├── database/
│   │   ├── migrations/       # Tus migraciones
│   │   ├── seeds/            # Tus seeds
│   │   └── data-source.ts
│   ├── app.module.ts
│   └── main.ts
├── podman-compose.yml
├── .env
├── .env.example
└── package.json
```

---

## Actualizar el core

### Pasos completos de actualización

```bash
# 1. Actualizar el paquete a la última versión
pnpm update @dh/backend-core

# 2. Correr las nuevas migraciones (si las hay)
pnpm migration:run

# 3. Verificar que la app levanta correctamente
pnpm start:dev
```

### Si se agregaron nuevas entidades al core

Nada que hacer. `CORE_ENTITIES` se actualiza automáticamente con cada versión del core — no tenés que tocar tu `data-source.ts`.

### Si hay cambios incompatibles (breaking changes)

Ante cualquier duda, revisá el historial del repo:

```bash
# Ver los últimos commits del core
cd node_modules/@dh/backend-core && git log --oneline -10
```

### Forzar reinstalación limpia

Si `pnpm update` no refleja los cambios (puede pasar con dependencias `git+ssh`):

```bash
# Reinstalar desde cero
pnpm remove @dh/backend-core
pnpm add git+ssh://git@github.com:DH-Multimedios/cms-backend-core.git

# Luego correr migraciones
pnpm migration:run
```
