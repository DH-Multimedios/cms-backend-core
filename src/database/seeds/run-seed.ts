import { AppDataSource } from '../data-source';
import { runCoreSeeds } from './core-seeds';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a base de datos establecida\n');
    await runCoreSeeds(AppDataSource);
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

runSeed();
