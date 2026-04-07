import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);

  const roles = [
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
