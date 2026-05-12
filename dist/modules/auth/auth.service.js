"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const bcrypt = __importStar(require("bcrypt"));
const session_entity_1 = require("../../database/entities/session.entity");
const password_reset_token_entity_1 = require("../../database/entities/password-reset-token.entity");
const users_service_1 = require("../users/users.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const settings_service_1 = require("../settings/settings.service");
const user_response_dto_1 = require("../users/dto/user-response.dto");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
let AuthService = class AuthService {
    authConfig;
    usersService;
    auditService;
    notificationsService;
    settingsService;
    sessionRepository;
    passwordResetTokenRepository;
    constructor(authConfig, usersService, auditService, notificationsService, settingsService, sessionRepository, passwordResetTokenRepository) {
        this.authConfig = authConfig;
        this.usersService = usersService;
        this.auditService = auditService;
        this.notificationsService = notificationsService;
        this.settingsService = settingsService;
        this.sessionRepository = sessionRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }
    async login(user, ip, userAgent) {
        await this.usersService.updateLastLogin(user.id);
        const rawSessionId = (0, crypto_1.randomUUID)();
        const tokenHash = this.hashToken(rawSessionId);
        const expiresAt = await this.buildExpiresAt();
        await this.sessionRepository.save(this.sessionRepository.create({
            token: tokenHash,
            userId: user.id,
            expiresAt,
            ip,
            userAgent,
        }));
        await this.auditService.log({
            action: 'login',
            entity: 'User',
            entityId: user.id,
            userId: user.id,
        });
        return { sessionId: rawSessionId, user: user_response_dto_1.UserResponseDto.from(user) };
    }
    async logout(rawSessionId, userId) {
        const tokenHash = this.hashToken(rawSessionId);
        await this.sessionRepository.update({ token: tokenHash, revokedAt: (0, typeorm_2.IsNull)() }, { revokedAt: new Date() });
        await this.auditService.log({
            action: 'logout',
            entity: 'User',
            entityId: userId,
            userId,
        });
        return { message: 'Sesión cerrada correctamente' };
    }
    async logoutAll(userId) {
        await this.sessionRepository.update({ userId, revokedAt: (0, typeorm_2.IsNull)() }, { revokedAt: new Date() });
        await this.auditService.log({
            action: 'logout_all',
            entity: 'User',
            entityId: userId,
            userId,
        });
        return { message: 'Todas las sesiones fueron cerradas' };
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.isActive) {
            return { message: 'Si el email existe, recibirás un código en breve' };
        }
        await this.passwordResetTokenRepository.update({ userId: user.id, usedAt: (0, typeorm_2.IsNull)() }, { usedAt: new Date() });
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = (0, crypto_1.createHash)('sha256').update(code).digest('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.passwordResetTokenRepository.save(this.passwordResetTokenRepository.create({
            userId: user.id,
            codeHash,
            expiresAt,
        }));
        await this.notificationsService.notifySystem('user.forgot-password-code', email, { code });
        return { message: 'Si el email existe, recibirás un código en breve' };
    }
    async verifyResetCode(email, code) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.isActive) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, 'Código inválido o expirado');
        }
        const codeHash = (0, crypto_1.createHash)('sha256').update(code).digest('hex');
        const token = await this.passwordResetTokenRepository.findOne({
            where: {
                userId: user.id,
                codeHash,
                usedAt: (0, typeorm_2.IsNull)(),
            },
        });
        if (!token || token.expiresAt < new Date()) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, 'Código inválido o expirado');
        }
        const resetToken = (0, crypto_1.randomUUID)();
        const resetTokenHash = (0, crypto_1.createHash)('sha256').update(resetToken).digest('hex');
        token.resetTokenHash = resetTokenHash;
        token.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.passwordResetTokenRepository.save(token);
        return { resetToken };
    }
    async resetPassword(resetToken, newPassword) {
        const resetTokenHash = (0, crypto_1.createHash)('sha256').update(resetToken).digest('hex');
        const token = await this.passwordResetTokenRepository.findOne({
            where: { resetTokenHash, usedAt: (0, typeorm_2.IsNull)() },
            relations: ['user'],
        });
        if (!token || token.expiresAt < new Date()) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, 'Token inválido o expirado');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(token.userId, hashedPassword);
        token.usedAt = new Date();
        await this.passwordResetTokenRepository.save(token);
        await this.sessionRepository.update({ userId: token.userId, revokedAt: (0, typeorm_2.IsNull)() }, { revokedAt: new Date() });
        return { message: 'Contraseña actualizada correctamente' };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
    async buildExpiresAt() {
        const raw = await this.settingsService.getValue('auth.sessionExpiration', '365');
        const days = parseInt(raw ?? '365', 10) || 365;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        return expiresAt;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CORE_AUTH_CONFIG')),
    __param(5, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(6, (0, typeorm_1.InjectRepository)(password_reset_token_entity_1.PasswordResetToken)),
    __metadata("design:paramtypes", [Object, users_service_1.UsersService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        settings_service_1.SettingsService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map