import { DataSource } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);
  const roleRepository = dataSource.getRepository(Role);

  // Permisos base del core
  const corePermissions = [
    // Users
    { name: 'users.read', description: 'Ver usuarios', module: 'users' },
    { name: 'users.create', description: 'Crear usuarios', module: 'users' },
    { name: 'users.update', description: 'Actualizar usuarios', module: 'users' },
    { name: 'users.delete', description: 'Eliminar usuarios', module: 'users' },

    // Roles
    { name: 'roles.read', description: 'Ver roles', module: 'roles' },
    { name: 'roles.create', description: 'Crear roles', module: 'roles' },
    { name: 'roles.update', description: 'Actualizar roles', module: 'roles' },
    { name: 'roles.delete', description: 'Eliminar roles', module: 'roles' },

    // Permissions
    { name: 'permissions.read', description: 'Ver permisos', module: 'permissions' },
    { name: 'permissions.create', description: 'Crear permisos', module: 'permissions' },
    { name: 'permissions.update', description: 'Actualizar permisos', module: 'permissions' },
    { name: 'permissions.delete', description: 'Eliminar permisos', module: 'permissions' },

    // Audit
    { name: 'audit.read', description: 'Ver auditoría', module: 'audit' },

    // Taxonomies
    { name: 'taxonomies.read', description: 'Ver taxonomías', module: 'taxonomies' },
    { name: 'taxonomies.create', description: 'Crear taxonomías', module: 'taxonomies' },
    { name: 'taxonomies.update', description: 'Actualizar taxonomías', module: 'taxonomies' },
    { name: 'taxonomies.delete', description: 'Eliminar taxonomías', module: 'taxonomies' },

    // Files
    { name: 'files.list', description: 'Listar archivos', module: 'files' },
    { name: 'files.read', description: 'Ver detalles de archivos', module: 'files' },
    { name: 'files.upload', description: 'Subir archivos', module: 'files' },
    { name: 'files.download', description: 'Descargar archivos', module: 'files' },
    { name: 'files.edit', description: 'Editar archivos', module: 'files' },
    { name: 'files.delete', description: 'Eliminar archivos', module: 'files' },

    // Media
    { name: 'media.read', description: 'Ver imágenes', module: 'media' },
    { name: 'media.upload', description: 'Subir imágenes', module: 'media' },
    { name: 'media.delete', description: 'Eliminar imágenes', module: 'media' },

    // Settings
    { name: 'settings.read', description: 'Ver configuración', module: 'settings' },
    { name: 'settings.update', description: 'Actualizar configuración', module: 'settings' },
  ];

  // Crear permisos
  const createdPermissions: Permission[] = [];
  for (const permData of corePermissions) {
    let permission = await permissionRepository.findOne({ where: { name: permData.name } });
    if (!permission) {
      permission = permissionRepository.create(permData);
      await permissionRepository.save(permission);
      console.log(`✅ Permiso creado: ${permData.name}`);
    } else {
      console.log(`⏭️  Permiso ya existe: ${permData.name}`);
    }
    createdPermissions.push(permission);
  }

  // Asignar TODOS los permisos a SuperAdmin
  const superAdminRole = await roleRepository.findOne({
    where: { name: 'SuperAdmin' },
    relations: ['permissions'],
  });

  if (superAdminRole) {
    superAdminRole.permissions = createdPermissions;
    await roleRepository.save(superAdminRole);
    console.log(`✅ Permisos asignados a SuperAdmin: ${createdPermissions.length}`);
  }

  // Asignar permisos limitados a Admin (solo read en la mayoría)
  const adminRole = await roleRepository.findOne({
    where: { name: 'Admin' },
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
        p.name === 'media.upload',
    );
    adminRole.permissions = adminPermissions;
    await roleRepository.save(adminRole);
    console.log(`✅ Permisos asignados a Admin: ${adminPermissions.length}`);
  }
}
