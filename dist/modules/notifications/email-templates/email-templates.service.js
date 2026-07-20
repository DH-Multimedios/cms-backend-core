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
exports.EmailTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_template_entity_1 = require("../../../database/entities/email-template.entity");
const email_layout_entity_1 = require("../../../database/entities/email-layout.entity");
const template_renderer_service_1 = require("../template-renderer.service");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../../common/enums/error-codes.enum");
let EmailTemplatesService = class EmailTemplatesService {
    repository;
    layoutRepository;
    renderer;
    constructor(repository, layoutRepository, renderer) {
        this.repository = repository;
        this.layoutRepository = layoutRepository;
        this.renderer = renderer;
    }
    async findAll(query = {}) {
        const { page = 1, limit = 20, sortOrder = 'ASC', sortBy = 'entityType', entityType } = query;
        const qb = this.repository.createQueryBuilder('template');
        if (entityType) {
            qb.where('template.entityType = :entityType', { entityType });
        }
        qb.orderBy(`template.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const template = await this.repository.findOne({
            where: { id },
            relations: { header: true, footer: true },
        });
        if (!template) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Template ${id} no encontrado`);
        }
        return template;
    }
    async findByType(entityType, notificationType) {
        return this.repository.findOne({
            where: { entityType, notificationType },
            relations: { header: true, footer: true },
        });
    }
    async create(dto) {
        const existing = await this.repository.findOneBy({
            entityType: dto.entityType,
            notificationType: dto.notificationType,
        });
        if (existing) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, `Ya existe un template para '${dto.entityType}.${dto.notificationType}'`);
        }
        const template = this.repository.create({ ...dto, variables: dto.variables ?? [] });
        const saved = await this.repository.save(template);
        return this.compileAndSave(saved);
    }
    async update(id, dto) {
        const template = await this.findOne(id);
        Object.assign(template, dto);
        const saved = await this.repository.save(template);
        return this.compileAndSave(saved);
    }
    async remove(id) {
        const template = await this.findOne(id);
        if (template.isDefault) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, 'No podés eliminar un template por defecto del core.');
        }
        await this.repository.remove(template);
        return { message: `Template '${template.name}' eliminado correctamente` };
    }
    async compileAndSave(template) {
        const full = await this.repository.findOne({
            where: { id: template.id },
            relations: { header: true, footer: true },
        });
        const headerSections = full?.header?.sections ?? [];
        const footerSections = full?.footer?.sections ?? [];
        full.compiledHtml = this.renderer.compile(headerSections, full.bodySections, footerSections);
        return this.repository.save(full);
    }
};
exports.EmailTemplatesService = EmailTemplatesService;
exports.EmailTemplatesService = EmailTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_template_entity_1.EmailTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(email_layout_entity_1.EmailLayout)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        template_renderer_service_1.TemplateRendererService])
], EmailTemplatesService);
//# sourceMappingURL=email-templates.service.js.map