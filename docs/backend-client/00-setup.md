# Configuración de un cliente nuevo

Esta guía es el punto de partida para un **cliente nuevo con una base PostgreSQL vacía**: instala `@dh/backend-core`, aplica el esquema y verifica la cookie HttpOnly `session_id`. El paquete instalado incluye esta documentación y `skills/backend-core/SKILL.md`; leé ambos desde la misma revisión fijada del paquete. El skill no se activa automáticamente por estar instalado.

**Si el cliente ya tiene datos o migraciones aplicadas, detenete antes de la sección 7:** el baseline del core no es una actualización de una base existente. Prepará una ruta de migración específica para ese historial.

## Ruta rápida verificada

- [ ] Confirmar que la base es nueva y vacía; si no lo es, acordar una migración específica antes de ejecutar comandos.
- [ ] Instalar por SSH el tag inmutable `v2.0.0` del core ESM y consultar los docs/skill incluidos en esa versión.
- [ ] Registrar `ConfigModule.forRoot({ isGlobal: true })` antes de `CoreModule.registerAsync`.
- [ ] Mantener `synchronize: false` y `CORE_ENTITIES` antes de las entidades del cliente.
- [ ] Incluir migraciones empaquetadas del core y migraciones TS/JS del cliente.
- [ ] Ejecutar migraciones, luego `runCoreSeeds(AppDataSource)` y después los seeds del cliente.
- [ ] Habilitar CORS con `credentials: true` y enviar credenciales desde el navegador.
- [ ] Registrar en Swagger la cookie bajo el esquema `session`.
- [ ] Verificar login y `/auth/me` desde el mismo navegador en Swagger UI.

El flujo completo es: crear proyecto, instalar, configurar `.env`, levantar PostgreSQL, ejecutar `pnpm migration:run`, ejecutar `pnpm seed`, iniciar con `pnpm start:dev` y probar la sesión.

## 1. Requisitos

- Node.js `^22.22.3 || ^24.15.0 || >=26.0.0` para instalar el core y crear un cliente con `nest new` o desarrollar este repositorio con `@nestjs/schematics` 12.
- NestJS 12 en el proyecto cliente, incluido `@nestjs/platform-express` 12; no mezcle versiones 11 y 12 de NestJS.
- pnpm 12 en el proyecto cliente, con autorización explícita de build para la revisión Git del core; el paquete prepara desde fuentes con su pnpm `12.6.0`. Para contribuir a este repositorio y ejecutar `test-app`, utilice pnpm `12.6.0`.
- NestJS CLI 12: `pnpm add --global @nestjs/cli@^12`.
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

# Instalar la versión ESM 2.0.0 por su tag Git inmutable.
pnpm add "git+ssh://git@github.com/DH-Multimedios/cms-backend-core.git#v2.0.0"

pnpm add @nestjs/common@^12 @nestjs/core@^12 @nestjs/platform-express@^12
pnpm add @nestjs/config@^12 @nestjs/swagger@^12 dotenv
pnpm add @nestjs/typeorm@^12 typeorm@^1.1.0 pg
pnpm add -D ts-node@^10.9.2
```

`typeorm-ts-node-esm` y `node --loader ts-node/esm` necesitan `ts-node` como dependencia **directa** del cliente para ejecutar fuentes `.ts`; con pnpm no dependas de que llegue transitivamente. Los scripts de producción que ejecutan `.js` compilado no usan este loader.

Este paquete es **ESM-only `2.0.0`** y se identifica por el tag Git inmutable `v2.0.0`, no solamente por el campo `version` del manifiesto. El lockfile del cliente fija el commit que resuelve ese tag: revisalo, guardalo junto a `package.json` y autorizá el build **del SHA exacto que indique pnpm**, no de cualquier revisión futura. Nunca muevas un tag publicado. El antiguo `1.0.0` conserva CommonJS; no se publica en un registry, por lo que `pnpm add @dh/backend-core@2.0.0` no sustituye la URL Git.

Tras instalar, el equipo encuentra esta guía en `node_modules/@dh/backend-core/docs/backend-client/00-setup.md` y el skill en `node_modules/@dh/backend-core/skills/backend-core/SKILL.md`. Para rutas de almacenamiento y autorización especializadas, consultá [Files](./files.md#storage-físico), [Media](./media.md#configuración-de-storage-en-producción) y [Permisos](./01-permissions.md); no trates ejemplos de módulos opcionales como pasos obligatorios del arranque.

Declarar ESM nativo, runtime y resolución NodeNext en el cliente:

```json
{
  "type": "module",
  "engines": {
    "node": "^22.22.3 || ^24.15.0 || >=26.0.0"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

### Autorización de build al instalar desde Git

pnpm 12 **rechaza la instalación Git** si no autorizás su preparación desde fuentes (`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`). Repetí `pnpm add` después de incorporar en `pnpm-workspace.yaml` la clave **exacta que imprime el error** (incluido el SHA resuelto); no habilites el paquete para cualquier ref:

```yaml
allowBuilds:
  '@dh/backend-core@git+ssh://git@github.com/DH-Multimedios/cms-backend-core.git#<sha-indicado-por-pnpm>': true
  '@scarf/scarf': false
  '@nestjs/core': true
  bcrypt: true
  sharp: true
  unrs-resolver: true
```

La clave de ejemplo es ilustrativa: copiá la forma y el SHA reales del diagnóstico de **tu instalación**. La lista transitiva depende del lockfile y la plataforma; consultá `pnpm ignored-builds` y clasificá explícitamente cada script antes de reintentar. En la prueba local, omitir `@scarf/scarf: false` produjo `ERR_PNPM_IGNORED_BUILDS`. No uses aprobaciones globales. pnpm también puede anunciar que el skill incluido espera aprobación: esa es una decisión **separada y opcional**, no una condición para importar el paquete. Commiteá la allow-list revisada junto al lockfile del cliente.

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
import { AppModule } from './app.module.js';

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

Este `DataSource` ESM funciona desde TypeScript con `typeorm-ts-node-esm` y desde JavaScript compilado. En esta revisión `import.meta.resolve` ubica `dist/index.js` del paquete instalado; por eso `dirname` apunta al `dist` que contiene las migraciones generadas durante la instalación Git. Esta estructura es parte de la distribución **de esta revisión**, no una garantía para versiones futuras. Las rutas no dependen del directorio de ejecución.

```typescript
import 'dotenv/config';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CORE_ENTITIES } from '@dh/backend-core';
import { DataSource } from 'typeorm';
// import { Product } from '../../modules/products/entities/product.entity';

const port = Number(process.env.DB_PORT);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('DB_PORT debe ser un entero entre 1 y 65535');
}

const coreDist = dirname(fileURLToPath(import.meta.resolve('@dh/backend-core')));
const clientDirectory = dirname(fileURLToPath(import.meta.url));
const clientMigrationExtension = import.meta.url.endsWith('.ts') ? 'ts' : 'js';

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
    join(coreDist, 'database/migrations/*.js'),
    join(clientDirectory, `migrations/*.${clientMigrationExtension}`),
  ],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
```

El ejemplo requiere que el proyecto NestJS use `"type": "module"` y TS `NodeNext`, no la salida CommonJS que trae un proyecto estándar. En TypeORM 1.1, valide los valores opcionales antes de usarlos en `where`, utilice `IsNull()` para SQL `NULL` y exprese relaciones como objeto, por ejemplo `relations: { roles: true }`.

Scripts:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-esm",
    "migration:generate": "pnpm typeorm migration:generate -d src/database/data-source.ts",
    "migration:run": "pnpm typeorm migration:run -d src/database/data-source.ts",
    "migration:revert": "pnpm typeorm migration:revert -d src/database/data-source.ts",
    "migration:run:prod": "typeorm migration:run -d dist/database/data-source.js",
    "seed": "node --loader ts-node/esm src/database/seeds/run-seed.ts",
    "seed:prod": "node dist/database/seeds/run-seed.js"
  }
}
```

`migration:generate` exige un path posicional. Ejemplo real:

```bash
pnpm migration:generate src/database/migrations/AddProducts
```

Antes de ejecutar migraciones, verificá **desde el cliente, después de instalar el core**, que la entrada y el baseline empaquetado correspondan a esta revisión:

```bash
node --input-type=module -e '
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const entry = fileURLToPath(import.meta.resolve("@dh/backend-core"));
const migration = join(dirname(entry), "database/migrations/1733500000100-BaselineSchema.js");
if (!entry.endsWith(join("dist", "index.js")) || !existsSync(migration)) {
  throw new Error("El core instalado no contiene el layout ESM y el baseline esperado; no ejecutes migraciones");
}
console.log("Core ESM y migración empaquetada verificados");
'
```

Si falla, revisá la versión y el lockfile antes de aplicar el esquema; no corrijas la ruta a ciegas. Para producción, compilá primero y ejecutá `pnpm migration:run:prod`; el glob del cliente seleccionará migraciones `.js`, mientras las migraciones del core salen del `dist` empaquetado.

> Esta guía es para instalaciones nuevas. La migración consolidada de baseline crea el esquema completo y no debe ejecutarse a ciegas sobre una base anterior al baseline. Para una base histórica, identifique su última migración aplicada y prepare una ruta de transición específica antes de actualizar el paquete.

## 8. Seeds del core y del cliente

```typescript
// src/database/seeds/run-seed.ts
import { runCoreSeeds } from '@dh/backend-core';
import { AppDataSource } from '../data-source.js';
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

`runCoreSeeds(AppDataSource)` debe ejecutarse siempre antes de cualquier seed del cliente. `seedPermissions` reemplaza las asignaciones de los roles base por permisos del core: si reejecutás los seeds después de asignar permisos propios del cliente, verificá y restaurá esas asignaciones. Registrarlos con `PermissionsService.registerPermissions` no los asigna a ningún rol; consultá [01-permissions.md](./01-permissions.md).

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

Verificá salud y sesión desde el **mismo navegador**, sin guardar cookies en archivos del proyecto:

1. Abrí `http://localhost:3000/api/health` y comprobá que responda correctamente.
2. Abrí `http://localhost:3000/api/docs` y ejecutá `POST /api/auth/login` con una cuenta creada por el seed. En las herramientas de red del navegador, comprobá que la respuesta incluya `Set-Cookie` para `session_id` con `HttpOnly`; no copies el valor de la cookie ni la contraseña a logs o al repositorio.
3. Sin cambiar de navegador ni de origen, ejecutá `GET /api/auth/me` desde Swagger UI: debe devolver el usuario autenticado. El navegador conserva y envía la cookie automáticamente. Si falla, revisá `credentials`, CORS y las políticas `SameSite`/`Secure` de la sección 5.

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

La entrega ESM `2.0.0` se identifica por `v2.0.0`. Cada actualización necesita un tag Git **nuevo e inmutable** `vMAJOR.MINOR.PATCH` que coincida con `package.json`: una corrección compatible sube PATCH (`2.0.1`), una funcionalidad compatible sube MINOR (`2.1.0`) y una ruptura de contrato sube MAJOR. Elegí solo una versión cuyo tag ya esté publicado, leé el changelog y revisá el lockfile:

```bash
CORE_VERSION='<nueva-version-publicada>' # Por ejemplo, 2.0.1 cuando exista v2.0.1
pnpm add "git+ssh://git@github.com/DH-Multimedios/cms-backend-core.git#v${CORE_VERSION}"
```

Con un SHA nuevo, actualizá también la clave exacta `allowBuilds` del Git dependency; quitá la autorización del SHA anterior si ya no lo usás. Commiteá `package.json`, `pnpm-workspace.yaml` y el lockfile del cliente. No uses `pnpm update @dh/backend-core` para seleccionar una versión Git. **No ejecutes migraciones ni seeds en una base existente solo por cambiar el tag:** comprobá su historial, planificá las migraciones compatibles, respaldá los datos y recién entonces aplicá la transición. Al reejecutar los seeds del core, preservá y restaurá las asignaciones de permisos propias del cliente: el seed reemplaza las de los roles base por su lista.
