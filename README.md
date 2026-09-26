# @dh/backend-core

> Core reutilizable para APIs en NestJS con autenticación, usuarios, roles y funcionalidades comunes.

## 🧩 Descripción

`@dh/backend-core` es una librería basada en NestJS que provee una base sólida y reutilizable para el desarrollo de APIs. Incluye módulos esenciales como autenticación, usuarios, roles, auditoría y health checks, desacoplados de cualquier lógica de negocio específica.

## 🎯 Objetivo

- Reutilizar lógica común entre proyectos
- Evitar duplicación de código
- Mantener consistencia arquitectónica
- Facilitar escalabilidad y mantenimiento

## 🧱 Módulos incluidos

- **Database** - Configuración de PostgreSQL + TypeORM
- **Auth** - Login, sesiones server-side y guards de autenticación
- **Users** - Gestión de usuarios con roles y permisos
- **Roles** - Gestión de roles con permisos granulares
- **Permissions** - Sistema de permisos dinámico
- **Audit** - Registro de acciones del sistema con metadata
- **Health** - Monitoreo del estado del sistema
- **Taxonomies** - Sistema de clasificación reutilizable
- **Files** - Gestión de archivos privados con control de acceso
- **Media** - Gestión de imágenes públicas con Sharp
- **Settings** - Configuración persistente con categorías
- **Notifications** - Sistema de notificaciones (email con MJML)
- **Email Providers** - Gestión de proveedores SMTP

## 🚀 Instalación

Requiere Node.js `>=22.12.0`, NestJS 12 (incluido `@nestjs/platform-express` 12),
TypeORM `^1.1.0` y `@nestjs/typeorm` `^12.0.0`. Para desarrollar este repositorio
con `@nestjs/schematics` 12 se requiere Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`.

### Desde GitHub (recomendado para desarrollo)

```bash
pnpm add git+ssh://git@github.com:tu-org/backend-core.git
```

### Local (para desarrollo del core)

```bash
# Clonar el repositorio
git clone git@github.com:tu-org/backend-core.git
cd backend-core

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
pnpm migration:run

# Ejecutar seeds
pnpm seed

# Iniciar en modo desarrollo
pnpm start:dev
```

Este repositorio y `test-app` son proyectos pnpm independientes; ambos utilizan pnpm `12.6.0`. Si Sharp detecta la libvips instalada en el sistema e intenta compilarse sin disponer de las herramientas nativas necesarias, evite esa detección durante la instalación local:

```bash
SHARP_IGNORE_GLOBAL_LIBVIPS=1 pnpm install
cd test-app
SHARP_IGNORE_GLOBAL_LIBVIPS=1 pnpm install
```

Esta alternativa utiliza el binario precompilado de Sharp. No es necesaria para otras instalaciones ni constituye un requisito para los proyectos clientes.

## ⚙️ Configuración

### Variables de entorno necesarias

Copia `.env.example` y configura las siguientes variables:

```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api
BASE_URL=https://api.tudominio.com  # URL pública para Media

# Storage
UPLOADS_PATH=uploads  # Path relativo para Files y Media

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_database
DB_SYNCHRONIZE=false  # NUNCA true en producción
DB_LOGGING=false

# Auth (sesiones)
# Duración de la sesión en días
SESSION_EXPIRATION=365

# System User (DEVELOPER/OWNER)
SYSTEM_USER_EMAIL=tu-email@personal.com
SYSTEM_USER_PASSWORD=password-ultra-segura

# SuperAdmin del cliente
SUPERADMIN_EMAIL=admin@cliente.com
SUPERADMIN_PASSWORD=password-del-cliente

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASS=smtp-password
SMTP_FROM=noreply@example.com
SMTP_FROM_NAME=Tu Aplicación

# CORS
CORS_ORIGINS=https://tuapp.com,https://dashboard.tuapp.com
```

### En tu proyecto cliente

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
          sessionExpiration: config.get('SESSION_EXPIRATION', '365'),
          cookiePath: '/',
        },
        modules: {
          audit: true,
          files: {
            storage: 'local',
            path: './uploads/files',
          },
          media: {
            storage: 'local',
            path: './uploads/media',
          },
          taxonomies: true,
          notifications: true,
        },
      }),
    }),
  ],
})
export class AppModule {}
```

La guía completa usa `ConfigModule.forRoot({ isGlobal: true })` antes de
`CoreModule.registerAsync(...)`; ver [Setup del proyecto cliente](./docs/backend-client/00-setup.md).
No habilites `synchronize`, ni siquiera en desarrollo: el schema se crea con migraciones.
El cliente también debe declarar `CORE_ENTITIES` antes de sus entidades, incluir las migraciones
del core y ejecutar `runCoreSeeds(AppDataSource)` antes de sus propios seeds.

Para autenticación por cookie, CORS debe conservar credenciales:

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGINS?.split(','),
  credentials: true,
});
```

## 🔐 Usuarios del sistema

El core incluye un sistema de usuarios con diferentes niveles:

### Usuario del sistema (`isSystemUser`)

- Cuenta operacional opcional y única en la base de datos
- Omite todas las verificaciones de permisos
- Está excluida de los endpoints de gestión de usuarios, pero no debe considerarse globalmente invisible
- Sus credenciales deben administrarse como secretos y se configuran mediante:
  - `SYSTEM_USER_EMAIL`
  - `SYSTEM_USER_PASSWORD`

### SuperAdmin del cliente

- Usuario con todos los permisos asignados
- Visible para el usuario del sistema
- Configurado mediante:
  - `SUPERADMIN_EMAIL`
  - `SUPERADMIN_PASSWORD`

### Usuarios protegidos (`isProtected`)

- No se pueden eliminar (excepto por usuario del sistema)
- Protege contra borrados accidentales

## 📚 Documentación

- **[Guía completa de módulos](./docs/)**
- **[Documentación para frontend](./docs/frontend/)** - Cómo consumir la API
- **[Documentación para backend-client](./docs/backend-client/)** - Cómo extender el core
- **[Plan de implementación](./docs/PLAN.md)** - Roadmap y features
- **[Decisiones arquitectónicas](./docs/DECISIONES.md)** - Por qué tomamos cada decisión

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests con coverage
pnpm test:cov

# Tests en modo watch
pnpm test:watch

# Tests e2e
pnpm test:e2e
```

## 🔄 Migraciones

```bash
# Generar migración
pnpm migration:generate src/database/migrations/NombreMigracion

# Ejecutar migraciones
pnpm migration:run

# Revertir última migración
pnpm migration:revert
```

## 🌱 Seeds

```bash
# Ejecutar seeds
pnpm seed
```

## 📦 Build

```bash
# Build para producción
pnpm build

# Ejecutar en producción
pnpm start:prod
```

## 📋 Scripts disponibles

- `pnpm start:dev` - Desarrollo con hot-reload
- `pnpm build` - Build de producción
- `pnpm lint` - Ejecutar ESLint
- `pnpm format` - Formatear código con Prettier
- `pnpm test` - Ejecutar tests
- `pnpm migration:run` - Ejecutar migraciones
- `pnpm seed` - Ejecutar seeds

## 🤝 Contribuir

Este es un proyecto privado. Para contribuir:

1. Crear un branch desde `main`
2. Implementar cambios
3. Asegurar que los tests pasen
4. Crear PR con descripción detallada

## 📝 Versionado

Seguimos [Semantic Versioning](https://semver.org/):

- **PATCH** (1.0.1) - Correcciones internas
- **MINOR** (1.1.0) - Nuevas funcionalidades compatibles
- **MAJOR** (2.0.0) - Cambios que rompen compatibilidad

## 📄 Licencia

UNLICENSED - Proyecto privado
