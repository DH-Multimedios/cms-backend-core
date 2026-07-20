import { AppDataSource } from '../data-source';
import { runCoreSeeds } from './core-seeds';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a base de datos establecida\n');
    await runCoreSeeds(AppDataSource);
  } catch (error) {
    console.error('❌ Error ejecutando seeds:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void runSeed();
