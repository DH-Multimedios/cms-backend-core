"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const local_auth_guard_1 = require("./guards/local-auth.guard");
const session_auth_guard_1 = require("./guards/session-auth.guard");
const public_decorator_1 = require("./decorators/public.decorator");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const login_dto_1 = require("./dto/login.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const verify_reset_code_dto_1 = require("./dto/verify-reset-code.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const user_entity_1 = require("../../database/entities/user.entity");
const user_response_dto_1 = require("../users/dto/user-response.dto");
let AuthController = class AuthController {
    authService;
    authConfig;
    constructor(authService, authConfig) {
        this.authService = authService;
        this.authConfig = authConfig;
    }
    get cookiePath() {
        return this.authConfig.cookiePath ?? '/auth';
    }
    get cookieSecure() {
        if (this.cookieSameSite === 'none')
            return true;
        return this.authConfig.cookieSecure ?? process.env.NODE_ENV === 'production';
    }
    get cookieSameSite() {
        return (this.authConfig.cookieSameSite ?? (process.env.NODE_ENV === 'production' ? 'lax' : 'none'));
    }
    get sessionMaxAge() {
        const days = this.authConfig.sessionExpiration
            ? parseInt(this.authConfig.sessionExpiration)
            : 365;
        return days * 24 * 60 * 60 * 1000;
    }
    async login(user, req, _dto, res) {
        const result = await this.authService.login(user, req.ip, req.headers['user-agent']);
        res.cookie('session_id', result.sessionId, {
            httpOnly: true,
            secure: this.cookieSecure,
            sameSite: this.cookieSameSite,
            maxAge: this.sessionMaxAge,
            path: '/',
        });
        return result;
    }
    async logout(user, req, res) {
        const rawSessionId = req.cookies?.session_id ?? req.headers['x-session-id'];
        res.clearCookie('session_id', { path: '/' });
        return this.authService.logout(rawSessionId, user.id);
    }
    async logoutAll(user, res) {
        res.clearCookie('session_id', { path: '/' });
        return this.authService.logoutAll(user.id);
    }
    me(user) {
        return user_response_dto_1.UserResponseDto.from(user);
    }
    myPermissions(user) {
        const permissionSet = new Set();
        let maxWeight = 0;
        for (const role of user.roles || []) {
            if (role.weight > maxWeight)
                maxWeight = role.weight;
            for (const perm of role.permissions || []) {
                permissionSet.add(perm.name);
            }
        }
        if (user.isSystemUser)
            maxWeight = 100;
        return {
            isSystemUser: user.isSystemUser,
            maxWeight,
            permissions: Array.from(permissionSet),
        };
    }
    forgotPassword(dto) {
        return this.authService.forgotPassword(dto.email);
    }
    verifyResetCode(dto) {
        return this.authService.verifyResetCode(dto.email, dto.code);
    }
    resetPassword(dto) {
        return this.authService.resetPassword(dto.resetToken, dto.newPassword);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login con email/username y password' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiSecurity)('session'),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar sesión actual' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('logout-all'),
    (0, swagger_1.ApiSecurity)('session'),
    (0, swagger_1.ApiOperation)({ summary: 'Cerrar todas las sesiones del usuario' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiSecurity)('session'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener usuario actual' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", user_response_dto_1.UserResponseDto)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)('me/permissions'),
    (0, swagger_1.ApiSecurity)('session'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener permisos del usuario actual' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "myPermissions", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar código de recuperación de contraseña' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify-reset-code'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar código y obtener token de reset' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_reset_code_dto_1.VerifyResetCodeDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyResetCode", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Establecer nueva contraseña con el token de reset' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard),
    (0, common_1.Controller)('auth'),
    __param(1, (0, common_1.Inject)('CORE_AUTH_CONFIG')),
    __metadata("design:paramtypes", [auth_service_1.AuthService, Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map