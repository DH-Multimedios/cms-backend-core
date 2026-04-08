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

## Paso 2 — Instalar el core

```bash
# Desde GitHub (recomendado)
pnpm add git+ssh://git@github.com:tu-org/backend-core.git

# O desde una versión específica
pnpm add git+ssh://git@github.com:tu-org/backend-core.git#v1.0.0
```

---

## Paso 3 — Configurar el AppModule

Reemplazá el contenido de `src/app.module.ts`:

```typescript
import 'dotenv/config';
import { Module } from '@nestjs/common';
import { CoreModule } from '@dh/backend-core';

@Module({
  imports: [
    CoreModule.register({
      database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: false,
        logging: process.env.DB_LOGGING === 'true',
      },
      auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiration: process.env.JWT_EXPIRATION || '1d',
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
        jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
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
        notifications: {
          email: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            from: process.env.SMTP_FROM,
          },
        },
      },
    }),

    // Tus módulos de negocio acá
    // ProductsModule,
    // OrdersModule,
  ],
})
export class AppModule {}
```

---

## Paso 4 — Actualizar main.ts

```typescript
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(process.env.API_PREFIX || 'api');

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
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

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@miproyecto.com
SMTP_PASS=smtp-password
SMTP_FROM=noreply@miproyecto.com

# CORS
CORS_ORIGINS=http://localhost:4200
```

---

## Paso 6 — Crear podman-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: docker.io/library/postgres:16-alpine
    container_name: mi-proyecto-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '${DB_PORT:-5432}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USERNAME}']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

> Usá un nombre de container diferente por proyecto (`mi-proyecto-postgres`) para evitar conflictos cuando corrés varios proyectos a la vez.

---

## Paso 7 — Configurar migraciones

Creá `src/database/data-source.ts`:

```typescript
import { DataSource } from 'typeorm';
import 'dotenv/config';

// Importar entidades del core y las propias
import * as coreEntities from '@dh/backend-core';
// import { Product } from './entities/product.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    ...Object.values(coreEntities), // Entidades del core
    // Product,                       // Tus entidades
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

runSeed();
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

```bash
# Ver versión actual
pnpm list @dh/backend-core

# Actualizar a la última versión
pnpm update @dh/backend-core

# Después de actualizar, correr nuevas migraciones si las hay
pnpm migration:run
```
