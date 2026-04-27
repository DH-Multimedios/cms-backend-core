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
import { CoreModule } from '@dh/backend-core';

@Module({
  imports: [
    CoreModule.register({
      database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
      },
      auth: {
        sessionExpiration: process.env.SESSION_EXPIRATION || '365',
        cookiePath: '/',
      },
      modules: {
        audit: true,
        files: {
          storage: 'local',
          path: './uploads/files',
          maxSize: 10485760, // 10MB
        },
        media: {
          storage: 'local',
          path: './uploads/media',
          maxSize: 5242880, // 5MB
        },
        taxonomies: true,
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
  ],
})
export class AppModule {}
```

## 🔐 Usuarios del sistema

El core incluye un sistema de usuarios con diferentes niveles:

### Usuario del sistema (`isSystemUser`)

- **Único en todo el sistema** (el desarrollador/propietario)
- Bypasea todos los permisos
- Invisible para todos los usuarios (incluso SuperAdmin del cliente)
- Configurado mediante variables de entorno:
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
