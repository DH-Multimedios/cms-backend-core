import { Module, DynamicModule, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule } from 'nestjs-cls';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
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
import { UserPreferencesModule } from '../modules/user-preferences/user-preferences.module';
import { AuditContextInterceptor } from '../modules/audit/interceptors/audit-context.interceptor';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { DebugRequestInterceptor } from '../common/interceptors/debug-request.interceptor';
import {
  CoreModuleConfig,
  CoreModuleAsyncOptions,
  ModulesConfig,
} from './interfaces/core-config.interface';

@Global()
@Module({})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }

  private static getMediaPath(modules?: ModulesConfig): string {
    const mediaConfig = modules?.media;
    if (mediaConfig && mediaConfig !== true && mediaConfig.path) {
      return mediaConfig.path;
    }
    return process.env.UPLOADS_PATH || 'uploads/media';
  }

  static register(config: CoreModuleConfig): DynamicModule {
    const mediaPath = this.getMediaPath(config.modules);
    const debugProviders = process.env.DEBUG_REQUESTS === 'true'
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
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        EventEmitterModule.forRoot(),
        ClsModule.forRoot({ global: true, middleware: { mount: true } }),
        ServeStaticModule.forRoot({
          rootPath: join(process.cwd(), mediaPath),
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
    const debugProviders = process.env.DEBUG_REQUESTS === 'true'
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
                rootPath: join(process.cwd(), mediaPath),
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
