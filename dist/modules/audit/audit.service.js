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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const nestjs_cls_1 = require("nestjs-cls");
const audit_log_entity_1 = require("../../database/entities/audit-log.entity");
const audit_log_response_dto_1 = require("./dto/audit-log-response.dto");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
let AuditService = class AuditService {
    auditLogRepository;
    cls;
    constructor(auditLogRepository, cls) {
        this.auditLogRepository = auditLogRepository;
        this.cls = cls;
    }
    async log(options) {
        const userId = options.userId !== undefined
            ? options.userId
            : (this.cls.get('userId') ?? null);
        const ip = this.cls.get('ip') ?? null;
        const userAgent = this.cls.get('userAgent') ?? null;
        const log = new audit_log_entity_1.AuditLog();
        log.userId = userId;
        log.action = options.action;
        log.entity = options.entity;
        log.entityId = options.entityId ?? null;
        log.metadata = options.metadata ?? null;
        log.ip = ip;
        log.userAgent = userAgent;
        await this.auditLogRepository.save(log);
    }
    async findAll(query) {
        const { page = 1, limit = 20, sortOrder = 'DESC', sortBy = 'createdAt', userId, entity, action, from, to } = query;
        const qb = this.auditLogRepository.createQueryBuilder('log')
            .leftJoin('log.user', 'user')
            .addSelect(['user.id', 'user.firstName', 'user.lastName'])
            .where('(user.isSystemUser = false OR log.userId IS NULL)');
        if (userId) {
            qb.andWhere('log.userId = :userId', { userId });
        }
        if (entity) {
            qb.andWhere('log.entity = :entity', { entity });
        }
        if (action) {
            qb.andWhere('log.action = :action', { action });
        }
        if (from) {
            qb.andWhere('log.createdAt >= :from', { from: new Date(from) });
        }
        if (to) {
            qb.andWhere('log.createdAt <= :to', { to: new Date(to) });
        }
        qb.orderBy(`log.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit);
        const [logs, total] = await qb.getManyAndCount();
        return {
            items: logs.map(audit_log_response_dto_1.AuditLogListItemDto.from),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const log = await this.auditLogRepository.createQueryBuilder('log')
            .leftJoin('log.user', 'user')
            .addSelect(['user.id', 'user.firstName', 'user.lastName'])
            .where('log.id = :id', { id })
            .getOne();
        if (!log) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Audit log ${id} no encontrado`);
        }
        return audit_log_response_dto_1.AuditLogDetailDto.from(log);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        nestjs_cls_1.ClsService])
], AuditService);
//# sourceMappingURL=audit.service.js.map