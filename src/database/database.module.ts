import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from '../core/interfaces/core-config.interface';
import * as entities from './entities';

@Module({})
export class DatabaseModule {
  static forRoot(config: DatabaseConfig): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRoot({
          type: config.type || 'postgres',
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
          entities: Object.values(entities),
          synchronize: config.synchronize || false,
          logging: config.logging || false,
          ssl: config.ssl || false,
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
