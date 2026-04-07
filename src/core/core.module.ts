import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../database/database.module';
import { CoreModuleConfig } from './interfaces/core-config.interface';

@Global()
@Module({})
export class CoreModule {
  static register(config: CoreModuleConfig): DynamicModule {
    const imports: any[] = [
      // Config global
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),

      // Event Emitter para comunicación entre módulos
      EventEmitterModule.forRoot(),

      // Database
      DatabaseModule.forRoot(config.database),
    ];

    // Módulos opcionales
    // TODO: Agregar módulos según config.modules (auth, users, roles, etc.)

    return {
      module: CoreModule,
      imports,
      exports: imports,
    };
  }
}
