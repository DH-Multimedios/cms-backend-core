import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from '../core/interfaces/core-config.interface';
import { CORE_ENTITIES } from './entities';

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
          entities: CORE_ENTITIES,
          autoLoadEntities: true,
          synchronize: config.synchronize || false,
          logging: config.logging || false,
          ssl: config.ssl || false,
        }),
      ],
      exports: [TypeOrmModule],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<DatabaseConfig> | DatabaseConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: options.imports,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return {
              type: config.type || 'postgres',
              host: config.host,
              port: config.port,
              username: config.username,
              password: config.password,
              database: config.database,
              entities: CORE_ENTITIES,
              autoLoadEntities: true,
              synchronize: config.synchronize || false,
              logging: config.logging || false,
              ssl: config.ssl || false,
            };
          },
          inject: options.inject || [],
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}
