"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const passport_1 = require("@nestjs/passport");
const session_entity_1 = require("../../database/entities/session.entity");
const password_reset_token_entity_1 = require("../../database/entities/password-reset-token.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const users_module_1 = require("../users/users.module");
const audit_module_1 = require("../audit/audit.module");
const notifications_module_1 = require("../notifications/notifications.module");
const settings_module_1 = require("../settings/settings.module");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const local_strategy_1 = require("./strategies/local.strategy");
const session_strategy_1 = require("./strategies/session.strategy");
const session_auth_guard_1 = require("./guards/session-auth.guard");
const permissions_guard_1 = require("./guards/permissions.guard");
let AuthModule = AuthModule_1 = class AuthModule {
    static register(authConfig) {
        return {
            module: AuthModule_1,
            imports: [
                passport_1.PassportModule,
                typeorm_1.TypeOrmModule.forFeature([session_entity_1.Session, password_reset_token_entity_1.PasswordResetToken, user_entity_1.User]),
                users_module_1.UsersModule,
                audit_module_1.AuditModule,
                notifications_module_1.NotificationsModule,
                settings_module_1.SettingsModule,
            ],
            controllers: [auth_controller_1.AuthController],
            providers: [
                { provide: 'CORE_AUTH_CONFIG', useValue: authConfig },
                auth_service_1.AuthService,
                local_strategy_1.LocalStrategy,
                session_strategy_1.SessionStrategy,
                session_auth_guard_1.SessionAuthGuard,
                permissions_guard_1.PermissionsGuard,
            ],
            exports: [auth_service_1.AuthService, session_auth_guard_1.SessionAuthGuard, permissions_guard_1.PermissionsGuard, 'CORE_AUTH_CONFIG'],
        };
    }
    static registerAsync(options) {
        return {
            module: AuthModule_1,
            imports: [
                ...(options.imports || []),
                passport_1.PassportModule,
                typeorm_1.TypeOrmModule.forFeature([session_entity_1.Session, password_reset_token_entity_1.PasswordResetToken, user_entity_1.User]),
                users_module_1.UsersModule,
                audit_module_1.AuditModule,
                notifications_module_1.NotificationsModule,
                settings_module_1.SettingsModule,
            ],
            controllers: [auth_controller_1.AuthController],
            providers: [
                {
                    provide: 'CORE_AUTH_CONFIG',
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
                auth_service_1.AuthService,
                local_strategy_1.LocalStrategy,
                session_strategy_1.SessionStrategy,
                session_auth_guard_1.SessionAuthGuard,
                permissions_guard_1.PermissionsGuard,
            ],
            exports: [auth_service_1.AuthService, session_auth_guard_1.SessionAuthGuard, permissions_guard_1.PermissionsGuard, 'CORE_AUTH_CONFIG'],
        };
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = AuthModule_1 = __decorate([
    (0, common_1.Module)({})
], AuthModule);
//# sourceMappingURL=auth.module.js.map