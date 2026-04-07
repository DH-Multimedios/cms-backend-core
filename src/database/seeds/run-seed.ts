import { AppDataSource } from '../data-source';
import { seedRoles } from './roles.seeder';
import { seedPermissions } from './permissions.seeder';
import { seedUsers } from './users.seeder';

async function runSeed() {
  console.log('🌱 Iniciando seeds...\n');

  try {
    // Inicializar data source
    await AppDataSource.initialize();
    console.log('✅ Conexión a base de datos establecida\n');

    // Ejecutar seeds en orden
    console.log('📝 Creando roles...');
    await seedRoles(AppDataSource);
    console.log('');

    console.log('📝 Creando permisos...');
    await seedPermissions(AppDataSource);
    console.log('');

    console.log('📝 Creando usuarios...');
    await seedUsers(AppDataSource);
    console.log('');

    console.log('✅ Seeds completados exitosamente!');
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeed();
