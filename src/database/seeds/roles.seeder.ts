import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { ExtraRole } from './core-seeds';

const CORE_ROLES = [
  {
    name: 'SuperAdmin',
    description: 'Super administrador del sistema con todos los permisos',
    weight: 100,
    isProtected: true,
  },
  {
    name: 'Admin',
    description: 'Administrador con permisos limitados',
    weight: 90,
    isProtected: true,
  },
  {
    name: 'User',
    description: 'Usuario estándar con permisos básicos',
    weight: 50,
    isProtected: true,
  },
];

export async function seedRoles(dataSource: DataSource, extraRoles?: ExtraRole[]): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);

  const roles = [
    ...CORE_ROLES,
    ...(extraRoles ?? []),
  ];

  for (const roleData of roles) {
    const exists = await roleRepository.findOne({ where: { name: roleData.name } });
    if (!exists) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`✅ Rol creado: ${roleData.name}`);
    } else {
      console.log(`⏭️  Rol ya existe: ${roleData.name}`);
    }
  }
}
