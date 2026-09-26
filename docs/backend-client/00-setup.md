# Configuración de un cliente nuevo

Esta guía instala `@dh/backend-core` en un proyecto NestJS nuevo, crea una base PostgreSQL desde cero y verifica autenticación por sesión con la cookie HttpOnly `session_id`.

## Ruta rápida verificada

- [ ] Instalar una revisión fija del core por SSH.
- [ ] Registrar `ConfigModule.forRoot({ isGlobal: true })` antes de `CoreModule.registerAsync`.
- [ ] Mantener `synchronize: false` y `CORE_ENTITIES` antes de las entidades del cliente.
- [ ] Incluir migraciones empaquetadas del core y migraciones TS/JS del cliente.
- [ ] Ejecutar migraciones, luego `runCoreSeeds(AppDataSource)` y después los seeds del cliente.
- [ ] Habilitar CORS con `credentials: true` y enviar credenciales desde el navegador.
- [ ] Registrar en Swagger la cookie bajo el esquema `session`.
- [ ] Verificar login y `/auth/me` con un cookie jar.

El flujo completo es: crear proyecto, instalar, configurar `.env`, levantar PostgreSQL, ejecutar `pnpm migration:run`, ejecutar `pnpm seed`, iniciar con `pnpm start:dev` y probar la sesión.

## 1. Requisitos

- Node.js `>=22.12.0` para consumir el core con NestJS 12 desde CommonJS. Para desarrollar este repositorio con `@nestjs/schematics` 12, use Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`.
- NestJS 12 en el proyecto cliente, incluido `@nestjs/platform-express` 12; no mezcle versiones 11 y 12 de NestJS.
- pnpm compatible con el proyecto cliente. Para contribuir a este repositorio y ejecutar `test-app`, utilice pnpm `12.6.0`; esta versión no es un requisito para los proyectos que consumen el core.
- NestJS CLI: `pnpm add --global @nestjs/cli`.
- PostgreSQL; los ejemplos usan Podman y `podman-compose`.
- Acceso SSH al repositorio privado de GitHub.

Verifique el acceso antes de instalar:

```bash
ssh -T git@github.com
```

GitHub puede responder sin abrir una shell interactiva; lo importante es que autentique la clave autorizada.

## 2. Crear e instalar

```bash
nest new mi-proyecto
cd mi-proyecto

# Sustituir por un tag publicado o por el SHA completo aprobado por el equipo.
CORE_REF='<release-tag-or-40-char-commit>'
pnpm add "git+ssh://git@github.com/DH-Multimedios/cms-backend-core.git#${CORE_REF}"

pnpm add @nestjs/common@^12 @nestjs/core@^12 @nestjs/platform-express@^12
pnpm add @nestjs/config@^12 @nestjs/swagger@^12 dotenv
pnpm add @nestjs/typeorm@^12 typeorm@^1.1.0 pg
```

No instale desde la rama por defecto sin fijar una revisión: dos instalaciones realizadas en fechas distintas podrían resolver código diferente. El placeholder `CORE_REF` debe reemplazarse antes de ejecutar el comando.

Declare el runtime y el target requeridos:

```json
{
  "engines": {
    "node": ">=22.12.0"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2023"
  }
}
```

### Scripts de build de pnpm

No apruebe todos los scripts transitivos. Primero liste los bloqueados y revise por qué los necesita el árbol instalado:

```bash
pnpm ignored-builds
```

Apruebe únicamente los paquetes requeridos que aparezcan en esa salida. Para este core normalmente son:

```bash
pnpm approve-builds @nestjs/core bcrypt sharp
```

La lista efectiva depende de plataforma y lockfile. Revise y commitee el `pnpm-workspace.yaml` generado con la allow-list; no use `pnpm approve-builds --all`.

## 3. Variables de entorno

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=mi_proyecto
DB_PASSWORD=mi_password
DB_NAME=mi_proyecto_dev
DB_LOGGING=false

# Fallback de sesión y duración de la cookie; ver nota debajo.
SESSION_EXPIRATION=365
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE=lax
# AUTH_COOKIE_DOMAIN=

CORS_ORIGINS=http://localhost:4200

# Cuentas opcionales. Defina cada email junto con su password.
SYSTEM_USER_EMAIL=system@miproyecto.internal
SYSTEM_USER_PASSWORD=gestionar-desde-secret-manager
SUPERADMIN_EMAIL=admin@miproyecto.com
SUPERADMIN_PASSWORD=gestionar-desde-secret-manager
ADMIN_EMAIL=support@miproyecto.com
ADMIN_PASSWORD=gestionar-desde-secret-manager
# USER_EMAIL=user@miproyecto.com
# USER_PASSWORD=gestionar-desde-secret-manager
```

`SESSION_EXPIRATION` es el fallback del core y determina `maxAge` de la cookie. Después de los seeds, la setting persistida `auth.sessionExpiration` es la autoridad para la expiración de sesiones en base de datos. Si cambia la duración operativa, mantenga ambos valores alineados o actualice la setting mediante el mecanismo administrativo correspondiente.

No existe un selector de módulos: `CoreModule` carga todos sus módulos. No agregue un objeto `modules` esperando habilitarlos o deshabilitarlos. Para un inicio nuevo, conserve los paths por defecto y consulte las guías de Files y Media antes de personalizar almacenamiento.

## 4. AppModule

`ConfigService<T>` no convierte strings de entorno por usar un generic. El puerto se convierte y valida explícitamente. La configuración de cookies omite `cookieSecure` cuando falta la variable para conservar el default seguro del core.

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfig, CoreModule, CoreModuleConfig } from '@dh/backend-core';

function databasePort(config: ConfigService): number {
  const port = Number(config.getOrThrow<string>('DB_PORT'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT debe ser un entero entre 1 y 65535');
  }
  return port;
}

function optionalBoolean(value: string | undefined, name: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} debe ser true o false`);
}

function authConfig(config: ConfigService): AuthConfig {
  const secure = optionalBoolean(config.get<string>('AUTH_COOKIE_SECURE'), 'AUTH_COOKIE_SECURE');
  const sameSite = config.get<string>('AUTH_COOKIE_SAME_SITE') ?? 'lax';

  if (!['strict', 'lax', 'none'].includes(sameSite)) {
    throw new Error('AUTH_COOKIE_SAME_SITE debe ser strict, lax o none');
  }
  if (process.env.NODE_ENV === 'production' && secure === false) {
    throw new Error('AUTH_COOKIE_SECURE no puede ser false en producción');
  }
  if (sameSite === 'none' && secure === false) {
    throw new Error('SameSite=None requiere una cookie Secure');
  }

  const domain = config.get<string>('AUTH_COOKIE_DOMAIN')?.trim() || undefined;
  return {
    sessionExpiration: config.get<string>('SESSION_EXPIRATION') ?? '365',
    cookiePath: '/',
    cookieDomain: domain,
    cookieSameSite: sameSite as AuthConfig['cookieSameSite'],
    ...(secure === undefined ? {} : { cookieSecure: secure }),
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): CoreModuleConfig => ({
        database: {
          host: config.getOrThrow<string>('DB_HOST'),
          port: databasePort(config),
          username: config.getOrThrow<string>('DB_USERNAME'),
          password: config.getOrThrow<string>('DB_PASSWORD'),
          database: config.getOrThrow<string>('DB_NAME'),
          synchronize: false,
          logging: config.get<string>('DB_LOGGING') === 'true',
        },
        auth: authConfig(config),
      }),
    }),
    // ProductsModule,
  ],
})
export class AppModule {}
```

El orden es obligatorio: `ConfigModule.forRoot({ isGlobal: true })` debe aparecer antes de `CoreModule.registerAsync`. `synchronize` debe permanecer en `false` en todos los entornos.

## 5. Bootstrap, CORS y Swagger

El core aplica `cookie-parser` globalmente. No lo registre de nuevo.

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

function corsOrigins(): string[] {
  const values = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Origen CORS inválido: ${value}`);
      }
      return url.origin;
    });

  if (values.length === 0 || values.includes('*')) {
    throw new Error('CORS_ORIGINS debe contener orígenes explícitos');
  }
  return [...new Set(values)];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api');
  app.enableCors({ origin: corsOrigins(), credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mi Proyecto API')
    .setVersion('1.0.0')
    .addCookieAuth('session_id', { type: 'apiKey', in: 'cookie' }, 'session')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
```

El tercer argumento de `addCookieAuth` crea el esquema OpenAPI `session`, que coincide con `@ApiCookieAuth('session')` en los controladores del core. En Swagger UI ejecute primero `POST /api/auth/login`; al estar servido por la misma API, el navegador conserva `session_id` para las operaciones protegidas.

### Escenarios de despliegue de cookies

| Escenario                                                                     | Configuración recomendada                                                                                                                                                                      |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend y API en el mismo origen                                             | No definir dominio; `SameSite=Lax`; `Secure=true` en producción HTTPS.                                                                                                                         |
| Mismo sitio en subdominios, por ejemplo `app.example.com` y `api.example.com` | `SameSite=Lax`; no definir dominio si solo la API necesita la cookie. Definir `AUTH_COOKIE_DOMAIN=.example.com` únicamente si debe compartirse entre subdominios.                              |
| Sitios distintos, por ejemplo `app.example.com` y `api.example.net`           | `SameSite=None`, `Secure=true`, HTTPS y orígenes CORS explícitos. Las políticas de cookies de terceros pueden bloquear este diseño; se recomienda un proxy same-site o BFF cuando sea posible. |

Si `AUTH_COOKIE_SECURE` no está definido, el core conserva su default: seguro en producción y además seguro cuando `SameSite=None`. El core rechaza explícitamente `cookieSecure: false` en producción y la combinación insegura `SameSite=None` con `Secure=false`.

El frontend debe enviar credenciales porque la cookie es HttpOnly:

```typescript
await fetch('https://api.example.com/api/auth/me', {
  credentials: 'include',
});

axios.get('https://api.example.com/api/auth/me', {
  withCredentials: true,
});
```

## 6. PostgreSQL local

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
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USERNAME} -d ${DB_NAME}']
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  mi_proyecto_data:
```

## 7. DataSource y migraciones TypeORM 1.1

Este `DataSource` funciona desde TypeScript con `typeorm-ts-node-commonjs` y desde JavaScript compilado. Resuelve las migraciones empaquetadas desde la ubicación real del paquete, sin depender del directorio de ejecución.

```typescript
import 'dotenv/config';
import { dirname, join } from 'node:path';
import { CORE_ENTITIES } from '@dh/backend-core';
import { DataSource } from 'typeorm';
// import { Product } from '../../modules/products/entities/product.entity';

const port = Number(process.env.DB_PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DB_PORT debe ser un entero entre 1 y 65535');
}

const coreRoot = dirname(require.resolve('@dh/backend-core/package.json'));
const clientMigrationExtension = __filename.endsWith('.ts') ? 'ts' : 'js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    ...CORE_ENTITIES,
    // Product,
  ],
  migrations: [
    join(coreRoot, 'dist/database/migrations/*.js'),
    join(__dirname, `migrations/*.${clientMigrationExtension}`),
  ],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
```

El ejemplo asume el CommonJS generado por un proyecto NestJS estándar. En TypeORM 1.1, valide los valores opcionales antes de usarlos en `where`, utilice `IsNull()` para SQL `NULL` y exprese relaciones como objeto, por ejemplo `relations: { roles: true }`.

Scripts:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "pnpm typeorm migration:generate -d src/database/data-source.ts",
    "migration:run": "pnpm typeorm migration:run -d src/database/data-source.ts",
    "migration:revert": "pnpm typeorm migration:revert -d src/database/data-source.ts",
    "migration:run:prod": "typeorm migration:run -d dist/database/data-source.js",
    "seed": "ts-node src/database/seeds/run-seed.ts",
    "seed:prod": "node dist/database/seeds/run-seed.js"
  }
}
```

`migration:generate` exige un path posicional. Ejemplo real:

```bash
pnpm migration:generate src/database/migrations/AddProducts
```

Para producción, compile primero y ejecute `pnpm migration:run:prod`; el glob del cliente seleccionará migraciones `.js`, mientras las migraciones del core siempre salen del `dist` empaquetado.

> Esta guía es para instalaciones nuevas. La migración consolidada de baseline crea el esquema completo y no debe ejecutarse a ciegas sobre una base anterior al baseline. Para una base histórica, identifique su última migración aplicada y prepare una ruta de transición específica antes de actualizar el paquete.

## 8. Seeds del core y del cliente

```typescript
// src/database/seeds/run-seed.ts
import { runCoreSeeds } from '@dh/backend-core';
import { AppDataSource } from '../data-source';
// import { seedProducts } from './products.seeder';

async function runSeed(): Promise<void> {
  try {
    await AppDataSource.initialize();
    await runCoreSeeds(AppDataSource);
    // await seedProducts(AppDataSource);
  } catch (error) {
    console.error('Error ejecutando seeds:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runSeed();
```

`runCoreSeeds(AppDataSource)` debe ejecutarse siempre antes de cualquier seed del cliente.

### Cuentas controladas por entorno

Todas las cuentas son opcionales y solo se crean cuando están definidos tanto email como password:

| Cuenta     | Variables                                   | Comportamiento                                                                                                                                                                                                  |
| ---------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sistema    | `SYSTEM_USER_EMAIL`, `SYSTEM_USER_PASSWORD` | Cuenta operacional opcional, única, protegida y altamente privilegiada. `isSystemUser=true` omite las verificaciones de permisos. Sus credenciales deben proceder de un secret manager y su uso debe auditarse. |
| SuperAdmin | `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`   | Cuenta protegida con rol `super_admin`; si falta algún valor, el seed avisa y continúa.                                                                                                                         |
| Admin      | `ADMIN_EMAIL`, `ADMIN_PASSWORD`             | Cuenta opcional con rol `admin`.                                                                                                                                                                                |
| Usuario    | `USER_EMAIL`, `USER_PASSWORD`               | Cuenta opcional con rol `user`.                                                                                                                                                                                 |

La cuenta de sistema no ofrece una garantía de invisibilidad global. Su bypass de permisos hace que deba tratarse como una credencial operacional crítica.

## 9. Primera ejecución y prueba de sesión

```bash
podman-compose up -d
pnpm migration:run
pnpm seed
pnpm start:dev
```

Verifique salud, login y reutilización de la cookie. Use las credenciales de una cuenta creada por el seed:

```bash
curl --fail http://localhost:3000/api/health

curl --fail-with-body --include \
  --cookie-jar .cookies.txt \
  --header 'Content-Type: application/json' \
  --data '{"login":"admin@miproyecto.com","password":"gestionar-desde-secret-manager"}' \
  http://localhost:3000/api/auth/login

curl --fail-with-body --include \
  --cookie .cookies.txt \
  http://localhost:3000/api/auth/me
```

La primera respuesta debe incluir `Set-Cookie: session_id=...; HttpOnly`; la segunda debe devolver el usuario autenticado. Swagger queda disponible en `http://localhost:3000/api/docs`.

## 10. Servicios y protección de endpoints

`CoreModule` registra todos los módulos. Estos son los principales servicios reutilizables:

| Módulo                  | Servicios exportados                                                            |
| ----------------------- | ------------------------------------------------------------------------------- |
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
| `NotificationsModule`   | `NotificationsService`; servicios internos adicionales según la guía específica |
| `UserPreferencesModule` | `UserPreferencesService`                                                        |

`BaseUserPreferencesService<T>` es una clase abstracta para extender con una entidad propia; no es un provider inyectable directo.

```typescript
import {
  CurrentUser,
  PermissionsGuard,
  Public,
  RequirePermissions,
  SessionAuthGuard,
} from '@dh/backend-core';

@Get()
@UseGuards(SessionAuthGuard, PermissionsGuard)
@RequirePermissions('products.read')
findAll() {}

@Get('me')
@UseGuards(SessionAuthGuard)
getProfile(@CurrentUser() user: User) {}

@Post('public')
@Public()
publicEndpoint() {}
```

La autenticación web usa `session_id`, `SessionAuthGuard` y `PermissionsGuard`; no requiere JWT.

## 11. Skill de OpenCode

OpenCode descubre skills del proyecto automáticamente bajo `.opencode/skills/`:

```bash
mkdir -p .opencode/skills/backend-core
cp node_modules/@dh/backend-core/skills/backend-core/SKILL.md \
  .opencode/skills/backend-core/SKILL.md
```

Commitee `.opencode/skills/backend-core/SKILL.md`. No agregue un array superior `skills` a `opencode.json`; esa configuración está obsoleta para auto-discovery. Después de actualizar deliberadamente el core, compare y revise la copia:

```bash
diff .opencode/skills/backend-core/SKILL.md \
  node_modules/@dh/backend-core/skills/backend-core/SKILL.md
```

## 12. Actualizaciones deliberadas

Una actualización debe cambiar explícitamente el tag o SHA fijado y revisar changelog, migraciones y diff de lockfile:

```bash
CORE_REF='<new-release-tag-or-40-char-commit>'
pnpm add "git+ssh://git@github.com/DH-Multimedios/cms-backend-core.git#${CORE_REF}"
pnpm migration:run
pnpm seed
pnpm start:dev
```

No use `pnpm update @dh/backend-core` como sustituto de seleccionar una revisión. En bases nuevas se ejecutan todas las migraciones empaquetadas; en bases existentes solo deben ejecutarse migraciones compatibles con su historial real.
