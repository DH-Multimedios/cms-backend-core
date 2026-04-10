import { DataSource } from 'typeorm';
import { seedRoles } from './roles.seeder';
import { seedPermissions } from './permissions.seeder';
import { seedUsers } from './users.seeder';
import { seedSettings } from './settings.seeder';

/**
 * Ejecuta todos los seeds del core (roles, permisos, usuarios).
 * Usado por proyectos clientes para inicializar la base de datos.
 *
 * @param dataSource - DataSource ya inicializado
 */
export async function runCoreSeeds(dataSource: DataSource): Promise<void> {
  console.log('🌱 Iniciando seeds del core...\n');

  console.log('📝 Creando roles...');
  await seedRoles(dataSource);
  console.log('');

  console.log('📝 Creando permisos...');
  await seedPermissions(dataSource);
  console.log('');

  console.log('📝 Creando usuarios...');
  await seedUsers(dataSource);
  console.log('');

  console.log('📝 Creando settings...');
  await seedSettings(dataSource);
  console.log('');

  console.log('✅ Seeds del core completados!');
}
