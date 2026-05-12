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
exports.SessionStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_custom_1 = require("passport-custom");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const session_entity_1 = require("../../../database/entities/session.entity");
const user_entity_1 = require("../../../database/entities/user.entity");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../../common/enums/error-codes.enum");
function extractSessionId(req) {
    return req?.cookies?.session_id ?? req.headers['x-session-id']?.toString() ?? null;
}
let SessionStrategy = class SessionStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'session') {
    sessionRepository;
    userRepository;
    constructor(sessionRepository, userRepository) {
        super();
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }
    async validate(req) {
        const rawSessionId = extractSessionId(req);
        if (!rawSessionId) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.UNAUTHORIZED, error_codes_enum_1.ErrorCode.INVALID_CREDENTIALS, 'Sesión no encontrada');
        }
        const tokenHash = (0, crypto_1.createHash)('sha256').update(rawSessionId).digest('hex');
        const session = await this.sessionRepository.findOne({
            where: {
                token: tokenHash,
                revokedAt: (0, typeorm_2.IsNull)(),
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
            relations: ['user', 'user.roles', 'user.roles.permissions'],
        });
        if (!session || !session.user?.isActive) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.UNAUTHORIZED, error_codes_enum_1.ErrorCode.INVALID_CREDENTIALS, 'Sesión inválida, expirada o usuario inactivo');
        }
        return session.user;
    }
};
exports.SessionStrategy = SessionStrategy;
exports.SessionStrategy = SessionStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SessionStrategy);
//# sourceMappingURL=session.strategy.js.map