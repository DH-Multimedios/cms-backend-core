import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { CORE_ENTITIES } from './entities';

// Cargar variables de entorno
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'backend_core_dev',
  entities: CORE_ENTITIES,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // NUNCA true en producción
  logging: process.env.DB_LOGGING === 'true',
});
