import { Module, DynamicModule, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule } from 'nestjs-cls';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { resolveUploadPaths } from './upload-paths.js';
import { DatabaseModule } from '../database/database.module.js';
import { HealthModule } from '../modules/health/health.module.js';
import { AuthModule } from '../modules/auth/auth.module.js';
import { UsersModule } from '../modules/users/users.module.js';
import { RolesModule } from '../modules/roles/roles.module.js';
import { PermissionsModule } from '../modules/permissions/permissions.module.js';
import { AuditModule } from '../modules/audit/audit.module.js';
import { SettingsModule } from '../modules/settings/settings.module.js';
import { EmailProvidersModule } from '../modules/email-providers/email-providers.module.js';
import { TaxonomiesModule } from '../modules/taxonomies/taxonomies.module.js';
import { FilesModule } from '../modules/files/files.module.js';
import { MediaModule } from '../modules/media/media.module.js';
import { NotificationsModule } from '../modules/notifications/notifications.module.js';
import { UserPreferencesModule } from '../modules/user-preferences/user-preferences.module.js';
import { AuditContextInterceptor } from '../modules/audit/interceptors/audit-context.interceptor.js';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter.js';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor.js';
import { DebugRequestInterceptor } from '../common/interceptors/debug-request.interceptor.js';
import {
  CoreModuleConfig,
  CoreModuleAsyncOptions,
  ModulesConfig,
} from './interfaces/core-config.interface.js';

@Global()
@Module({})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }

  private static getMediaPath(modules?: ModulesConfig): string {
    const mediaPath = modules?.media && modules.media !== true ? modules.media.path : undefined;
    const filesPath = modules?.files && modules.files !== true ? modules.files.path : undefined;
    return resolveUploadPaths({ filesPath, mediaPath }).media;
  }

  static register(config: CoreModuleConfig): DynamicModule {
    const configModule = ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' });
    const mediaPath = this.getMediaPath(config.modules);
    const debugProviders =
      process.env.DEBUG_REQUESTS === 'true'
        ? [{ provide: APP_INTERCEPTOR, useClass: DebugRequestInterceptor }]
        : [];

    return {
      module: CoreModule,
      providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
        { provide: APP_INTERCEPTOR, useClass: AuditContextInterceptor },
        ...debugProviders,
      ],
      imports: [
        configModule,
        EventEmitterModule.forRoot(),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        ServeStaticModule.forRoot({
          rootPath: resolve(mediaPath),
          serveRoot: '/uploads/media/',
          serveStaticOptions: { index: false },
        }),
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
        MediaModule,
        EmailProvidersModule,
        NotificationsModule,
        UserPreferencesModule,
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
        UserPreferencesModule,
      ],
    };
  }

  static registerAsync(options: CoreModuleAsyncOptions): DynamicModule {
    const debugProviders =
      process.env.DEBUG_REQUESTS === 'true'
        ? [{ provide: APP_INTERCEPTOR, useClass: DebugRequestInterceptor }]
        : [];

    return {
      module: CoreModule,
      providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
        { provide: APP_INTERCEPTOR, useClass: AuditContextInterceptor },
        ...debugProviders,
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
        AuthModule.registerAsync({
          imports: options.imports,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return config.auth;
          },
          inject: options.inject || [],
        }),
        ServeStaticModule.forRootAsync({
          imports: options.imports || [],
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            const mediaPath = CoreModule.getMediaPath(config.modules);
            return [
              {
                rootPath: resolve(mediaPath),
                serveRoot: '/uploads/media/',
                serveStaticOptions: { index: false },
              },
            ];
          },
          inject: options.inject || [],
        }),
        HealthModule,
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
        UserPreferencesModule,
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
        UserPreferencesModule,
      ],
    };
  }
}
