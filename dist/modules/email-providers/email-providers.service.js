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
exports.EmailProvidersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_provider_entity_1 = require("../../database/entities/email-provider.entity");
const audit_service_1 = require("../audit/audit.service");
const permissions_service_1 = require("../permissions/permissions.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
let EmailProvidersService = class EmailProvidersService {
    repository;
    auditService;
    permissionsService;
    constructor(repository, auditService, permissionsService) {
        this.repository = repository;
        this.auditService = auditService;
        this.permissionsService = permissionsService;
    }
    async onModuleInit() {
        await this.permissionsService.registerPermissions([
            {
                name: 'email-providers.read',
                description: 'Ver providers de email',
                module: 'email-providers',
                moduleName: 'Email Providers',
            },
            {
                name: 'email-providers.create',
                description: 'Crear providers de email',
                module: 'email-providers',
                moduleName: 'Email Providers',
            },
            {
                name: 'email-providers.update',
                description: 'Modificar providers de email',
                module: 'email-providers',
                moduleName: 'Email Providers',
            },
            {
                name: 'email-providers.delete',
                description: 'Eliminar providers de email',
                module: 'email-providers',
                moduleName: 'Email Providers',
            },
        ]);
    }
    findAll() {
        return this.repository.find({ order: { isActive: 'DESC', createdAt: 'ASC' } });
    }
    async findOne(id) {
        const provider = await this.repository.findOneBy({ id });
        if (!provider) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Provider ${id} no encontrado`);
        }
        return provider;
    }
    async findActive() {
        return this.repository.findOneBy({ isActive: true });
    }
    async create(dto) {
        const config = this.extractConfig(dto);
        const provider = this.repository.create({
            name: dto.name,
            provider: dto.provider,
            from: dto.from,
            config,
            isActive: false,
        });
        const saved = await this.repository.save(provider);
        await this.auditService.log({
            action: 'create',
            entity: 'EmailProvider',
            entityId: String(saved.id),
            metadata: { after: { name: saved.name, provider: saved.provider } },
        });
        return saved;
    }
    async update(id, dto) {
        const provider = await this.findOne(id);
        if (dto.provider && dto.provider !== provider.provider) {
            provider.config = this.extractConfig(dto);
            provider.provider = dto.provider;
        }
        else if (dto.smtp || dto.resend || dto.googleOAuth) {
            provider.config = this.extractConfig({
                ...dto,
                provider: provider.provider,
            });
        }
        if (dto.name !== undefined)
            provider.name = dto.name;
        if (dto.from !== undefined)
            provider.from = dto.from;
        const saved = await this.repository.save(provider);
        await this.auditService.log({
            action: 'update',
            entity: 'EmailProvider',
            entityId: String(saved.id),
            metadata: { after: { name: saved.name, provider: saved.provider } },
        });
        return saved;
    }
    async activate(id) {
        const provider = await this.findOne(id);
        await this.repository
            .createQueryBuilder()
            .update()
            .set({ isActive: false })
            .where('isActive = true')
            .execute();
        provider.isActive = true;
        const saved = await this.repository.save(provider);
        await this.auditService.log({
            action: 'activate',
            entity: 'EmailProvider',
            entityId: String(id),
            metadata: { after: { name: saved.name, provider: saved.provider, isActive: true } },
        });
        return saved;
    }
    async remove(id) {
        const provider = await this.findOne(id);
        if (provider.isActive) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, 'No podés eliminar el provider activo. Activá otro primero.');
        }
        await this.auditService.log({
            action: 'delete',
            entity: 'EmailProvider',
            entityId: String(id),
            metadata: { before: { name: provider.name, provider: provider.provider } },
        });
        await this.repository.remove(provider);
    }
    extractConfig(dto) {
        switch (dto.provider) {
            case 'smtp':
                if (!dto.smtp) {
                    throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, 'Falta configuración SMTP');
                }
                return dto.smtp;
            case 'resend':
                if (!dto.resend) {
                    throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, 'Falta configuración Resend');
                }
                return dto.resend;
            case 'google-oauth':
                if (!dto.googleOAuth) {
                    throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, 'Falta configuración Google OAuth');
                }
                return dto.googleOAuth;
        }
    }
};
exports.EmailProvidersService = EmailProvidersService;
exports.EmailProvidersService = EmailProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_provider_entity_1.EmailProvider)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_service_1.AuditService,
        permissions_service_1.PermissionsService])
], EmailProvidersService);
//# sourceMappingURL=email-providers.service.js.map