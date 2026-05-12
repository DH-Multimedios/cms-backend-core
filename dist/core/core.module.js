"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const nestjs_cls_1 = require("nestjs-cls");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const database_module_1 = require("../database/database.module");
const health_module_1 = require("../modules/health/health.module");
const auth_module_1 = require("../modules/auth/auth.module");
const users_module_1 = require("../modules/users/users.module");
const roles_module_1 = require("../modules/roles/roles.module");
const permissions_module_1 = require("../modules/permissions/permissions.module");
const audit_module_1 = require("../modules/audit/audit.module");
const settings_module_1 = require("../modules/settings/settings.module");
const email_providers_module_1 = require("../modules/email-providers/email-providers.module");
const taxonomies_module_1 = require("../modules/taxonomies/taxonomies.module");
const files_module_1 = require("../modules/files/files.module");
const media_module_1 = require("../modules/media/media.module");
const notifications_module_1 = require("../modules/notifications/notifications.module");
const user_preferences_module_1 = require("../modules/user-preferences/user-preferences.module");
const audit_context_interceptor_1 = require("../modules/audit/interceptors/audit-context.interceptor");
const http_exception_filter_1 = require("../common/filters/http-exception.filter");
const response_interceptor_1 = require("../common/interceptors/response.interceptor");
const debug_request_interceptor_1 = require("../common/interceptors/debug-request.interceptor");
let CoreModule = CoreModule_1 = class CoreModule {
    configure(consumer) {
        consumer.apply((0, cookie_parser_1.default)()).forRoutes('*');
    }
    static getMediaPath(modules) {
        const mediaConfig = modules?.media;
        if (mediaConfig && mediaConfig !== true && mediaConfig.path) {
            return mediaConfig.path;
        }
        return process.env.UPLOADS_PATH || 'uploads/media';
    }
    static register(config) {
        const mediaPath = this.getMediaPath(config.modules);
        const debugProviders = process.env.DEBUG_REQUESTS === 'true'
            ? [{ provide: core_1.APP_INTERCEPTOR, useClass: debug_request_interceptor_1.DebugRequestInterceptor }]
            : [];
        return {
            module: CoreModule_1,
            providers: [
                { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
                { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
                { provide: core_1.APP_INTERCEPTOR, useClass: audit_context_interceptor_1.AuditContextInterceptor },
                ...debugProviders,
            ],
            imports: [
                config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
                event_emitter_1.EventEmitterModule.forRoot(),
                nestjs_cls_1.ClsModule.forRoot({ global: true, middleware: { mount: true } }),
                serve_static_1.ServeStaticModule.forRoot({
                    rootPath: (0, path_1.join)(process.cwd(), mediaPath),
                    serveRoot: '/uploads/media/',
                    serveStaticOptions: { index: false },
                }),
                database_module_1.DatabaseModule.forRoot(config.database),
                health_module_1.HealthModule,
                auth_module_1.AuthModule.register(config.auth),
                users_module_1.UsersModule,
                roles_module_1.RolesModule,
                permissions_module_1.PermissionsModule,
                audit_module_1.AuditModule,
                settings_module_1.SettingsModule,
                taxonomies_module_1.TaxonomiesModule,
                files_module_1.FilesModule,
                media_module_1.MediaModule,
                email_providers_module_1.EmailProvidersModule,
                notifications_module_1.NotificationsModule,
                user_preferences_module_1.UserPreferencesModule,
            ],
            exports: [
                config_1.ConfigModule,
                event_emitter_1.EventEmitterModule,
                database_module_1.DatabaseModule,
                auth_module_1.AuthModule,
                users_module_1.UsersModule,
                roles_module_1.RolesModule,
                permissions_module_1.PermissionsModule,
                audit_module_1.AuditModule,
                settings_module_1.SettingsModule,
                taxonomies_module_1.TaxonomiesModule,
                files_module_1.FilesModule,
                media_module_1.MediaModule,
                email_providers_module_1.EmailProvidersModule,
                notifications_module_1.NotificationsModule,
                user_preferences_module_1.UserPreferencesModule,
            ],
        };
    }
    static registerAsync(options) {
        const debugProviders = process.env.DEBUG_REQUESTS === 'true'
            ? [{ provide: core_1.APP_INTERCEPTOR, useClass: debug_request_interceptor_1.DebugRequestInterceptor }]
            : [];
        return {
            module: CoreModule_1,
            providers: [
                { provide: core_1.APP_FILTER, useClass: http_exception_filter_1.HttpExceptionFilter },
                { provide: core_1.APP_INTERCEPTOR, useClass: response_interceptor_1.ResponseInterceptor },
                { provide: core_1.APP_INTERCEPTOR, useClass: audit_context_interceptor_1.AuditContextInterceptor },
                ...debugProviders,
            ],
            imports: [
                ...(options.imports || []),
                event_emitter_1.EventEmitterModule.forRoot(),
                nestjs_cls_1.ClsModule.forRoot({ global: true, middleware: { mount: true } }),
                database_module_1.DatabaseModule.forRootAsync({
                    imports: options.imports,
                    useFactory: async (...args) => {
                        const config = await options.useFactory(...args);
                        return config.database;
                    },
                    inject: options.inject || [],
                }),
                auth_module_1.AuthModule.registerAsync({
                    imports: options.imports,
                    useFactory: async (...args) => {
                        const config = await options.useFactory(...args);
                        return config.auth;
                    },
                    inject: options.inject || [],
                }),
                serve_static_1.ServeStaticModule.forRootAsync({
                    imports: options.imports || [],
                    useFactory: async (...args) => {
                        const config = await options.useFactory(...args);
                        const mediaPath = CoreModule_1.getMediaPath(config.modules);
                        return [
                            {
                                rootPath: (0, path_1.join)(process.cwd(), mediaPath),
                                serveRoot: '/uploads/media/',
                                serveStaticOptions: { index: false },
                            },
                        ];
                    },
                    inject: options.inject || [],
                }),
                health_module_1.HealthModule,
                users_module_1.UsersModule,
                roles_module_1.RolesModule,
                permissions_module_1.PermissionsModule,
                audit_module_1.AuditModule,
                settings_module_1.SettingsModule,
                taxonomies_module_1.TaxonomiesModule,
                files_module_1.FilesModule,
                media_module_1.MediaModule,
                email_providers_module_1.EmailProvidersModule,
                notifications_module_1.NotificationsModule,
                user_preferences_module_1.UserPreferencesModule,
            ],
            exports: [
                config_1.ConfigModule,
                event_emitter_1.EventEmitterModule,
                database_module_1.DatabaseModule,
                auth_module_1.AuthModule,
                users_module_1.UsersModule,
                roles_module_1.RolesModule,
                permissions_module_1.PermissionsModule,
                audit_module_1.AuditModule,
                settings_module_1.SettingsModule,
                taxonomies_module_1.TaxonomiesModule,
                files_module_1.FilesModule,
                media_module_1.MediaModule,
                email_providers_module_1.EmailProvidersModule,
                notifications_module_1.NotificationsModule,
                user_preferences_module_1.UserPreferencesModule,
            ],
        };
    }
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = CoreModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], CoreModule);
//# sourceMappingURL=core.module.js.map