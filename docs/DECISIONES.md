# Decisiones Técnicas - @dh/backend-core

Documento de decisiones arquitectónicas y técnicas tomadas durante el diseño del core.

---

## 1. Relación Taxonomies → Media

### Decisión

✅ **Composición en el controlador, NO en el servicio base**

### Justificación

- `TaxonomyService` NO llama directamente a `MediaService`
- La composición se hace en el controlador cuando `includeImage=true`
- Esto mantiene los servicios desacoplados
- Si mañana cambia Media, solo se toca el controlador

### Implementación

```ts
// taxonomy.controller.ts
@Get()
async findAll(@Query('includeImage') includeImage: boolean) {
  const taxonomies = await this.taxonomyService.findAll();
  
  if (!includeImage) return taxonomies;

  // Composición explícita en el controlador
  const imageIds = taxonomies.map(t => t.imageId).filter(Boolean);
  const images = await this.mediaService.findByIds(imageIds);
  const imageMap = new Map(images.map(img => [img.id, img]));

  return taxonomies.map(t => ({
    ...t,
    image: t.imageId ? imageMap.get(t.imageId) : null
  }));
}
```

---

## 2. Sistema de permisos por módulo

### Decisión

✅ **Los módulos de negocio registran sus permisos mediante `OnModuleInit`**

### Justificación

- Cada módulo define sus propios permisos
- Se registran automáticamente al iniciar el módulo
- El core provee permisos base (users, roles, permissions, etc.)
- Los módulos de negocio extienden el sistema sin modificar el core

### Implementación

```ts
// products.module.ts (módulo de negocio)
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

---

## 3. Usuario del sistema (isSystemUser)

### Decisión

✅ **Un único usuario de seguridad con bypass total y protección absoluta**

### Justificación

- Usuario de escape para el desarrollador/propietario del sistema
- Previene problemas de acceso (clientes que borran admins, impagos, etc.)
- Invisible para todos los usuarios del sistema
- Solo accesible mediante credenciales en `.env`

### Reglas

1. **Solo UNO** en toda la base de datos (validado en seed)
2. Email configurado en `.env` (email personal del desarrollador)
3. **Bypasea TODOS los permisos** (hardcoded en guards)
4. **Invisible en listados** para TODOS los usuarios (incluso otros admins)
5. **Visible en auditoría** (para debugging)
6. **Inmutable** (no se puede editar ni eliminar desde la API)

### Implementación

```ts
// user.entity.ts
@Entity('users')
export class User {
  @Column({ default: false })
  isSystemUser: boolean; // Usuario del sistema (único)

  @Column({ default: false })
  isProtected: boolean; // Otros usuarios críticos del cliente
}
```

```ts
// permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;

    // Usuario del sistema bypasea TODO
    if (user.isSystemUser) {
      return true;
    }

    // Validación normal de permisos
    const requiredPermissions = this.reflector.get('permissions', context.getHandler());
    return this.validatePermissions(user, requiredPermissions);
  }
}
```

```ts
// user.service.ts
async findAll(currentUser: User): Promise<User[]> {
  const query = this.userRepository.createQueryBuilder('user');

  // Si NO sos usuario del sistema, no ves usuarios del sistema
  if (!currentUser.isSystemUser) {
    query.andWhere('user.isSystemUser = :isSystemUser', { isSystemUser: false });
  }

  return query.getMany();
}
```

### Variables de entorno

```bash
# Usuario del sistema (desarrollador/propietario)
SYSTEM_USER_EMAIL=tu-email@personal.com
SYSTEM_USER_PASSWORD=password-ultra-segura

# SuperAdmin del cliente
SUPERADMIN_EMAIL=admin@cliente.com
SUPERADMIN_PASSWORD=password-del-cliente

# Admin del cliente (opcional)
ADMIN_EMAIL=support@cliente.com
ADMIN_PASSWORD=password-del-cliente
```

---

## 4. Flag isProtected

### Decisión

✅ **Flag inmutable para proteger usuarios críticos del cliente**

### Justificación

- Usuarios protegidos NO se pueden eliminar (excepto por usuario del sistema)
- Protege contra borrados accidentales
- Usado para SuperAdmin del cliente, administradores críticos

### Reglas

1. `isProtected` es **inmutable** después de creación
2. Los usuarios protegidos SON VISIBLES para el usuario del sistema
3. Los usuarios protegidos NO son visibles para Admins normales
4. NO se puede editar/eliminar un usuario protegido a menos que seas usuario del sistema

### Implementación

```ts
// user.service.ts
async delete(currentUser: User, id: number): Promise<void> {
  const targetUser = await this.findOne(id);

  // Solo el usuario del sistema puede eliminar usuarios protegidos
  if (targetUser.isProtected && !currentUser.isSystemUser) {
    throw new ForbiddenException('Cannot delete protected user');
  }

  // Validar permisos normales
  if (!currentUser.isSystemUser) {
    this.validatePermission(currentUser, 'users.delete');
  }

  await this.userRepository.delete(id);
}
```

---

## 5. Sistema de peso de roles

### Decisión

✅ **Peso SOLO para jerarquía visual, NO para bypass de permisos**

### Justificación

- El peso se usa para:
  1. Ordenar roles en el frontend
  2. Evitar que un Admin asigne un rol de mayor peso
- NO se usa para autorización
- Todos los usuarios se validan por permisos (excepto usuario del sistema)

### Implementación

```ts
// role.entity.ts
@Entity('roles')
export class Role {
  @Column({ type: 'int', default: 0 })
  weight: number; // Solo para UI y jerarquía visual
}
```

```ts
// user.service.ts
async assignRole(currentUser: User, userId: number, roleId: number): Promise<void> {
  const role = await this.roleService.findOne(roleId);
  
  // No podés asignar un rol de mayor peso que el tuyo (excepto usuario del sistema)
  if (!currentUser.isSystemUser) {
    const currentUserMaxWeight = Math.max(...currentUser.roles.map(r => r.weight));
    if (role.weight > currentUserMaxWeight) {
      throw new ForbiddenException('Cannot assign role with higher weight');
    }
  }

  await this.userRoleRepository.insert({ userId, roleId });
}
```

---

## 6. Migraciones y sincronización

### Decisión

✅ **Migraciones versionadas en producción, `synchronize: true` en desarrollo**

### Justificación

- Desarrollo: `synchronize: true` para rapidez
- Producción: migraciones controladas para seguridad y trazabilidad

### Implementación

```ts
// database.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  // ... otras configs
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['dist/migrations/*.js'],
  migrationsRun: process.env.NODE_ENV === 'production',
})
```

---

## 7. Seeds iniciales

### Decisión

✅ **Seeds con usuarios de seguridad mediante variables de entorno**

### Justificación

- Permite configurar usuarios sin hardcodear credenciales
- Facilita deployment en múltiples entornos
- Mantiene seguridad de credenciales

### Implementación

Ver sección 3 (Usuario del sistema) para variables de entorno.

---

## 8. Testing

### Decisión

✅ **Tests desde el inicio, mínimo en módulos críticos**

### Justificación

- Previene regresiones en funcionalidades base
- Facilita refactors
- Aumenta confianza en el core

### Cobertura mínima

- Auth: login, token validation, guards
- Users: CRUD, protección de usuarios del sistema
- Roles: asignación, jerarquía por peso
- Permissions: validación, registro de módulos

---

## 9. Notificaciones

### Decisión

✅ **Incluir provider de email (SMTP) desde el inicio**

### Justificación

- Sin provider, el módulo es solo boilerplate
- Email es el caso de uso más común
- SMTP es simple y universal

### Implementación

```ts
// Configuración
CoreModule.register({
  modules: {
    notifications: {
      email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.SMTP_FROM,
      }
    }
  }
})
```

---

## 10. Documentación

### Decisión

✅ **Swagger + docs manuales para frontend y cliente**

### Justificación

- Swagger: documentación automática de la API
- `docs/frontend/`: guías de integración para el equipo de frontend
- `docs/client/`: especificaciones de métodos disponibles del core

### Estructura

```
docs/
├── frontend/
│   ├── autenticacion.md
│   ├── permisos.md
│   └── taxonomias.md
└── client/
    ├── api-reference.md
    └── examples.md
```

---

## 11. Estructura de módulos del core

### Decisión

✅ **Módulos independientes, acoplamiento controlado**

### Módulos incluidos

1. **Database** - Configuración de TypeORM + PostgreSQL
2. **Auth** - Login, JWT, guards
3. **Users** - Gestión de usuarios
4. **Roles** - Gestión de roles y permisos
5. **Audit** - Logging de acciones
6. **Health** - Monitoreo del sistema
7. **Taxonomies** - Sistema de clasificación
8. **Files** - Gestión de archivos
9. **Media** - Gestión de imágenes
10. **Settings** - Configuración persistente
11. **Notifications** - Sistema de notificaciones (email)

### Acoplamiento permitido dentro del core

- `Auth → Users`
- `Auth → Settings`
- `Users → Roles`
- `Audit → Users`

### Acoplamiento NO permitido

- `Taxonomies → Media` (composición en controlador)
- Módulos de negocio → Auth/Roles directamente (usan guards y decorators)

---

## 12. Distribución del core

### Decisión

✅ **Paquete npm instalado desde GitHub (git+ssh)**

### Justificación

- Simple para empezar
- No requiere configurar npm privado
- Versionado mediante tags de Git

### Instalación

```bash
pnpm add git+ssh://git@github.com:tu-org/backend-core.git#v1.0.0
```

### Migración futura (opcional)

- GitHub Packages
- npm privado
- Verdaccio (autohosted)

---

## Resumen de principios

1. **Modularidad**: cada módulo encapsula su responsabilidad
2. **Simplicidad**: evitar sobreingeniería
3. **Seguridad**: usuario del sistema + permisos granulares
4. **Extensibilidad**: módulos de negocio extienden sin modificar el core
5. **Consistencia**: arquitectura común en todos los proyectos
6. **Testabilidad**: tests desde el inicio en módulos críticos
