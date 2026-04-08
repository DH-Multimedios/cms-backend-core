import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../database/database.module';
import { HealthModule } from '../modules/health/health.module';
import { CoreModuleConfig } from './interfaces/core-config.interface';

@Global()
@Module({})
export class CoreModule {
  static register(config: CoreModuleConfig): DynamicModule {
    return {
      module: CoreModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        EventEmitterModule.forRoot(),
        DatabaseModule.forRoot(config.database),
        HealthModule,
      ],
      exports: [ConfigModule, EventEmitterModule, DatabaseModule],
    };
  }
}
