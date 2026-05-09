import { DataSource } from 'typeorm';
import { seedRoles } from './roles.seeder';
import { seedPermissions } from './permissions.seeder';
import { seedUsers } from './users.seeder';
import { seedSettings } from './settings.seeder';
import { seedNotifications } from './notifications.seeder';

export interface ExtraRole {
  name: string;
  label: string;
  description?: string;
  weight?: number;
  isProtected?: boolean;
}

export interface CoreSeedOptions {
  /** Roles adicionales a crear después de los roles base del core */
  extraRoles?: ExtraRole[];
}

/**
 * Ejecuta todos los seeds del core (roles, permisos, usuarios).
 * Usado por proyectos clientes para inicializar la base de datos.
 *
 * @param dataSource - DataSource ya inicializado
 * @param options - Opciones opcionales para extender los seeds del core
 */
export async function runCoreSeeds(dataSource: DataSource, options?: CoreSeedOptions): Promise<void> {
  console.log('🌱 Iniciando seeds del core...\n');

  console.log('📝 Creando roles...');
  await seedRoles(dataSource, options?.extraRoles);
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

  console.log('📝 Creando notificaciones...');
  await seedNotifications(dataSource);
  console.log('');

  console.log('✅ Seeds del core completados!');
}
