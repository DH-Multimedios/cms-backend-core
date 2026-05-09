import { DataSource } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);
  const roleRepository = dataSource.getRepository(Role);

  // Permisos base del core
  const corePermissions = [
    // Users
    { name: 'users.read', description: 'Ver usuarios', module: 'users', moduleName: 'Usuarios' },
    {
      name: 'users.create',
      description: 'Crear usuarios',
      module: 'users',
      moduleName: 'Usuarios',
    },
    {
      name: 'users.update',
      description: 'Actualizar usuarios',
      module: 'users',
      moduleName: 'Usuarios',
    },
    {
      name: 'users.delete',
      description: 'Eliminar usuarios',
      module: 'users',
      moduleName: 'Usuarios',
    },

    // Roles
    { name: 'roles.read', description: 'Ver roles', module: 'roles', moduleName: 'Roles' },
    { name: 'roles.create', description: 'Crear roles', module: 'roles', moduleName: 'Roles' },
    { name: 'roles.update', description: 'Actualizar roles', module: 'roles', moduleName: 'Roles' },
    { name: 'roles.delete', description: 'Eliminar roles', module: 'roles', moduleName: 'Roles' },

    // Permissions
    {
      name: 'permissions.read',
      description: 'Ver permisos',
      module: 'permissions',
      moduleName: 'Permisos',
    },
    {
      name: 'permissions.create',
      description: 'Crear permisos',
      module: 'permissions',
      moduleName: 'Permisos',
    },
    {
      name: 'permissions.update',
      description: 'Actualizar permisos',
      module: 'permissions',
      moduleName: 'Permisos',
    },
    {
      name: 'permissions.delete',
      description: 'Eliminar permisos',
      module: 'permissions',
      moduleName: 'Permisos',
    },

    // Audit
    { name: 'audit.read', description: 'Ver auditoría', module: 'audit', moduleName: 'Auditoría' },

    // Taxonomies
    {
      name: 'taxonomies.read',
      description: 'Ver taxonomías',
      module: 'taxonomies',
      moduleName: 'Taxonomías',
    },
    {
      name: 'taxonomies.create',
      description: 'Crear taxonomías',
      module: 'taxonomies',
      moduleName: 'Taxonomías',
    },
    {
      name: 'taxonomies.update',
      description: 'Actualizar taxonomías',
      module: 'taxonomies',
      moduleName: 'Taxonomías',
    },
    {
      name: 'taxonomies.delete',
      description: 'Eliminar taxonomías',
      module: 'taxonomies',
      moduleName: 'Taxonomías',
    },

    // Files
    { name: 'files.list', description: 'Listar archivos', module: 'files', moduleName: 'Archivos' },
    {
      name: 'files.read',
      description: 'Ver detalles de archivos',
      module: 'files',
      moduleName: 'Archivos',
    },
    {
      name: 'files.upload',
      description: 'Subir archivos',
      module: 'files',
      moduleName: 'Archivos',
    },
    {
      name: 'files.download',
      description: 'Descargar archivos',
      module: 'files',
      moduleName: 'Archivos',
    },
    { name: 'files.edit', description: 'Editar archivos', module: 'files', moduleName: 'Archivos' },
    {
      name: 'files.delete',
      description: 'Eliminar archivos',
      module: 'files',
      moduleName: 'Archivos',
    },

    // Media
    {
      name: 'media.list',
      description: 'Listar imágenes',
      module: 'media',
      moduleName: 'Multimedia',
    },
    {
      name: 'media.read',
      description: 'Ver detalles de imágenes',
      module: 'media',
      moduleName: 'Multimedia',
    },
    {
      name: 'media.upload',
      description: 'Subir imágenes',
      module: 'media',
      moduleName: 'Multimedia',
    },
    {
      name: 'media.edit',
      description: 'Editar imágenes (texto alternativo)',
      module: 'media',
      moduleName: 'Multimedia',
    },
    {
      name: 'media.delete',
      description: 'Eliminar imágenes',
      module: 'media',
      moduleName: 'Multimedia',
    },

    // Settings
    {
      name: 'settings.read',
      description: 'Ver configuración',
      module: 'settings',
      moduleName: 'Configuración',
    },
    {
      name: 'settings.update',
      description: 'Actualizar configuración',
      module: 'settings',
      moduleName: 'Configuración',
    },
    {
      name: 'settings.delete',
      description: 'Eliminar configuraciones y categorías',
      module: 'settings',
      moduleName: 'Configuración',
    },
  ];

  // Crear permisos
  const createdPermissions: Permission[] = [];
  for (const permData of corePermissions) {
    let permission = await permissionRepository.findOne({ where: { name: permData.name } });
    if (!permission) {
      permission = permissionRepository.create(permData);
      await permissionRepository.save(permission);
      console.log(`✅ Permiso creado: ${permData.name}`);
    } else if (
      permission.description !== permData.description ||
      permission.module !== permData.module ||
      permission.moduleName !== permData.moduleName
    ) {
      permission.description = permData.description;
      permission.module = permData.module;
      permission.moduleName = permData.moduleName;
      await permissionRepository.save(permission);
      console.log(`🔄 Permiso actualizado: ${permData.name}`);
    } else {
      console.log(`⏭️  Permiso ya existe: ${permData.name}`);
    }
    createdPermissions.push(permission);
  }

  // Asignar TODOS los permisos a SuperAdmin
  const superAdminRole = await roleRepository.findOne({
    where: { name: 'super_admin' },
    relations: ['permissions'],
  });

  if (superAdminRole) {
    superAdminRole.permissions = createdPermissions;
    await roleRepository.save(superAdminRole);
    console.log(`✅ Permisos asignados a super_admin: ${createdPermissions.length}`);
  }

  // Asignar permisos limitados a Admin (solo read en la mayoría)
  const adminRole = await roleRepository.findOne({
    where: { name: 'admin' },
    relations: ['permissions'],
  });

  if (adminRole) {
    const adminPermissions = createdPermissions.filter(
      (p) =>
        p.name.endsWith('.read') ||
        p.name === 'users.create' ||
        p.name === 'users.update' ||
        p.name === 'taxonomies.create' ||
        p.name === 'taxonomies.update' ||
        p.name === 'files.upload' ||
        p.name === 'media.upload' ||
        p.name === 'media.edit',
    );
    adminRole.permissions = adminPermissions;
    await roleRepository.save(adminRole);
    console.log(`✅ Permisos asignados a admin: ${adminPermissions.length}`);
  }

  // Asignar permisos básicos a User
  const userRole = await roleRepository.findOne({
    where: { name: 'user' },
    relations: ['permissions'],
  });

  if (userRole) {
    const userPermissions = createdPermissions.filter((p) =>
      [
        'files.list',
        'files.read',
        'files.download',
        'files.upload',
        'media.list',
        'media.read',
        'media.upload',
        'taxonomies.read',
      ].includes(p.name),
    );
    userRole.permissions = userPermissions;
    await roleRepository.save(userRole);
    console.log(`✅ Permisos asignados a user: ${userPermissions.length}`);
  }
}
