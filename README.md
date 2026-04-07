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
- **Auth** - Login, JWT, guards de autenticación
- **Users** - Gestión de usuarios
- **Roles** - Gestión de roles y permisos
- **Audit** - Registro de acciones del sistema
- **Health** - Monitoreo del estado del sistema
- **Taxonomies** - Sistema de clasificación reutilizable
- **Files** - Gestión de archivos
- **Media** - Gestión de imágenes
- **Settings** - Configuración persistente
- **Notifications** - Sistema de notificaciones (email)

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
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiration: '1d',
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
        jwtRefreshExpiration: '7d',
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

- [Documentación completa](./docs/)
- [Plan de implementación](./PLAN.md)
- [Decisiones arquitectónicas](./DECISIONES.md)
- [Guía para frontend](./docs/frontend/)
- [Referencia de API](./docs/client/)

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
