import { Module, DynamicModule, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../database/database.module';
import { HealthModule } from '../modules/health/health.module';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { RolesModule } from '../modules/roles/roles.module';
import { PermissionsModule } from '../modules/permissions/permissions.module';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { CoreModuleConfig, CoreModuleAsyncOptions } from './interfaces/core-config.interface';

@Global()
@Module({})
export class CoreModule {
  static register(config: CoreModuleConfig): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
      ],
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        EventEmitterModule.forRoot(),
        DatabaseModule.forRoot(config.database),
        HealthModule,
        AuthModule.register(config.auth),
        UsersModule,
        RolesModule,
        PermissionsModule,
      ],
      exports: [
        ConfigModule,
        EventEmitterModule,
        DatabaseModule,
        AuthModule,
        UsersModule,
        RolesModule,
        PermissionsModule,
      ],
    };
  }

  static registerAsync(options: CoreModuleAsyncOptions): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
      ],
      imports: [
        ...(options.imports || []),
        EventEmitterModule.forRoot(),
        DatabaseModule.forRootAsync({
          imports: options.imports,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return config.database;
          },
          inject: options.inject || [],
        }),
        HealthModule,
        AuthModule.registerAsync({
          imports: options.imports,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return config.auth;
          },
          inject: options.inject || [],
        }),
        UsersModule,
        RolesModule,
        PermissionsModule,
      ],
      exports: [
        ConfigModule,
        EventEmitterModule,
        DatabaseModule,
        AuthModule,
        UsersModule,
        RolesModule,
        PermissionsModule,
      ],
    };
  }
}
