import { Module, DynamicModule, Global } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule } from 'nestjs-cls';
import { DatabaseModule } from '../database/database.module';
import { HealthModule } from '../modules/health/health.module';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { RolesModule } from '../modules/roles/roles.module';
import { PermissionsModule } from '../modules/permissions/permissions.module';
import { AuditModule } from '../modules/audit/audit.module';
import { SettingsModule } from '../modules/settings/settings.module';
import { EmailProvidersModule } from '../modules/email-providers/email-providers.module';
import { TaxonomiesModule } from '../modules/taxonomies/taxonomies.module';
import { FilesModule } from '../modules/files/files.module';
import { MediaModule } from '../modules/media/media.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';
import { AuditContextInterceptor } from '../modules/audit/interceptors/audit-context.interceptor';
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
        { provide: APP_INTERCEPTOR, useClass: AuditContextInterceptor },
      ],
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        EventEmitterModule.forRoot(),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        DatabaseModule.forRoot(config.database),
        HealthModule,
        AuthModule.register(config.auth),
        UsersModule,
        RolesModule,
        PermissionsModule,
        AuditModule,
        SettingsModule,
        TaxonomiesModule,
        FilesModule,
        EmailProvidersModule,
        NotificationsModule,
      ],
      exports: [
        ConfigModule,
        EventEmitterModule,
        DatabaseModule,
        AuthModule,
        UsersModule,
        RolesModule,
        PermissionsModule,
        AuditModule,
        SettingsModule,
        TaxonomiesModule,
        FilesModule,
        EmailProvidersModule,
        NotificationsModule,
      ],
    };
  }

  static registerAsync(options: CoreModuleAsyncOptions): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
        { provide: APP_INTERCEPTOR, useClass: AuditContextInterceptor },
      ],
      imports: [
        ...(options.imports || []),
        EventEmitterModule.forRoot(),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
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
        AuditModule,
        SettingsModule,
        TaxonomiesModule,
        FilesModule,
        MediaModule,
        EmailProvidersModule,
        NotificationsModule,
      ],
      exports: [
        ConfigModule,
        EventEmitterModule,
        DatabaseModule,
        AuthModule,
        UsersModule,
        RolesModule,
        PermissionsModule,
        AuditModule,
        SettingsModule,
        TaxonomiesModule,
        FilesModule,
        MediaModule,
        EmailProvidersModule,
        NotificationsModule,
      ],
    };
  }
}
