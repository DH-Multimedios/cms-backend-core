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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("../../database/entities/setting.entity");
const setting_category_entity_1 = require("../../database/entities/setting-category.entity");
const media_entity_1 = require("../../database/entities/media.entity");
const audit_service_1 = require("../audit/audit.service");
const permissions_service_1 = require("../permissions/permissions.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const slug_util_1 = require("../../common/utils/slug.util");
let SettingsService = class SettingsService {
    settingRepository;
    categoryRepository;
    mediaRepository;
    auditService;
    permissionsService;
    constructor(settingRepository, categoryRepository, mediaRepository, auditService, permissionsService) {
        this.settingRepository = settingRepository;
        this.categoryRepository = categoryRepository;
        this.mediaRepository = mediaRepository;
        this.auditService = auditService;
        this.permissionsService = permissionsService;
    }
    getInputTypeSchemas() {
        return INPUT_TYPE_SCHEMAS;
    }
    async onModuleInit() {
        await this.permissionsService.registerPermissions([
            {
                name: 'settings.create',
                description: 'Crear settings',
                module: 'settings',
                moduleName: 'Configuración',
            },
            {
                name: 'settings.update',
                description: 'Modificar settings y categorías',
                module: 'settings',
                moduleName: 'Configuración',
            },
            {
                name: 'settings.delete',
                description: 'Eliminar settings y categorías',
                module: 'settings',
                moduleName: 'Configuración',
            },
        ]);
    }
    async findAllCategories(page = 1, limit = 20) {
        const qb = this.categoryRepository
            .createQueryBuilder('category')
            .loadRelationCountAndMap('category.settingsCount', 'category.settings')
            .orderBy('category.order', 'ASC')
            .addOrderBy('category.id', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);
        const [items, total] = await qb.getManyAndCount();
        return {
            items: items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findCategoryBySlug(slug, page = 1, limit = 20) {
        const category = await this.categoryRepository.findOneBy({ slug });
        if (!category) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Categoría '${slug}' no encontrada`);
        }
        const [settings, settingsTotal] = await this.settingRepository.findAndCount({
            where: { categoryId: category.id },
            order: { order: 'ASC', key: 'ASC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        await Promise.all(settings.map((s) => this.injectImageMeta(s)));
        return Object.assign(category, {
            settings,
            settingsTotal,
            settingsPage: page,
            settingsLimit: limit,
            settingsPages: Math.ceil(settingsTotal / limit),
        });
    }
    async createCategory(dto) {
        const slug = dto.slug ?? (0, slug_util_1.generateSlug)(dto.label);
        const existing = await this.categoryRepository.findOneBy({ slug });
        if (existing) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, `Ya existe una categoría con el slug '${slug}'`);
        }
        const category = this.categoryRepository.create({ ...dto, slug });
        const saved = await this.categoryRepository.save(category);
        await this.auditService.log({
            action: 'create',
            entity: 'SettingCategory',
            entityId: String(saved.id),
            metadata: { after: { slug: saved.slug, label: saved.label } },
        });
        return saved;
    }
    async updateCategory(id, dto) {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Categoría ${id} no encontrada`);
        }
        if (dto.slug) {
            if (dto.slug !== category.slug) {
                const existing = await this.categoryRepository.findOneBy({ slug: dto.slug });
                if (existing) {
                    throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, `Ya existe una categoría con el slug '${dto.slug}'`);
                }
            }
        }
        else if (dto.label && dto.label !== category.label) {
            dto.slug = (0, slug_util_1.generateSlug)(dto.label);
            if (dto.slug !== category.slug) {
                const existing = await this.categoryRepository.findOneBy({ slug: dto.slug });
                if (existing) {
                    throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, `El slug generado '${dto.slug}' ya existe. Enviá un slug explícito.`);
                }
            }
        }
        const before = { slug: category.slug, label: category.label };
        Object.assign(category, dto);
        const saved = await this.categoryRepository.save(category);
        await this.auditService.log({
            action: 'update',
            entity: 'SettingCategory',
            entityId: String(saved.id),
            metadata: { before, after: { slug: saved.slug, label: saved.label } },
        });
        return saved;
    }
    async reorderCategories(dto) {
        await Promise.all(dto.ids.map((id, index) => this.categoryRepository.update(id, { order: index })));
        return { message: 'Orden actualizado correctamente' };
    }
    async removeCategory(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['settings'],
        });
        if (!category) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Categoría ${id} no encontrada`);
        }
        if (category.isProtected) {
            throw new common_1.ForbiddenException('Esta categoría está protegida y no puede eliminarse');
        }
        if (category.settings?.length) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, `La categoría tiene ${category.settings.length} setting(s) asociados. Reasignalos o eliminalos primero.`);
        }
        await this.auditService.log({
            action: 'delete',
            entity: 'SettingCategory',
            entityId: String(id),
            metadata: { before: { slug: category.slug, label: category.label } },
        });
        await this.categoryRepository.remove(category);
        return { message: `Categoría '${category.label}' eliminada correctamente` };
    }
    async findAll(query) {
        const qb = this.settingRepository
            .createQueryBuilder('setting')
            .leftJoinAndSelect('setting.category', 'category');
        if (query.categoryId) {
            qb.andWhere('setting.categoryId = :categoryId', { categoryId: query.categoryId });
        }
        else if (query.category) {
            qb.andWhere('category.slug = :slug', { slug: query.category });
        }
        qb.orderBy('category.order', 'ASC')
            .addOrderBy('setting.order', 'ASC')
            .addOrderBy('setting.key', 'ASC');
        const settings = await qb.getMany();
        await Promise.all(settings.map((s) => this.injectImageMeta(s)));
        return settings;
    }
    async findByKey(key) {
        const setting = await this.settingRepository.findOne({
            where: { key },
            relations: ['category'],
        });
        if (!setting) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Setting '${key}' no encontrado`);
        }
        await this.injectImageMeta(setting);
        return setting;
    }
    async getValue(key, defaultValue) {
        const setting = await this.settingRepository.findOneBy({ key });
        return setting?.value ?? defaultValue;
    }
    async create(dto) {
        const existing = await this.settingRepository.findOneBy({ key: dto.key });
        if (existing) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, `Ya existe un setting con el key '${dto.key}'`);
        }
        if (dto.categoryId) {
            const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
            if (!category) {
                throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Categoría ${dto.categoryId} no encontrada`);
            }
        }
        const setting = this.settingRepository.create(dto);
        const saved = await this.settingRepository.save(setting);
        await this.auditService.log({
            action: 'create',
            entity: 'Setting',
            entityId: saved.id,
            metadata: {
                after: { key: saved.key, value: saved.type === 'password' ? '***' : saved.value },
            },
        });
        return saved;
    }
    async update(id, dto) {
        const setting = await this.settingRepository.findOne({
            where: { id },
            relations: ['category'],
        });
        if (!setting) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Setting ${id} no encontrado`);
        }
        if (dto.key && dto.key !== setting.key) {
            const existing = await this.settingRepository.findOneBy({ key: dto.key });
            if (existing) {
                throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, `Ya existe un setting con el key '${dto.key}'`);
            }
        }
        if (dto.categoryId && dto.categoryId !== setting.categoryId) {
            const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
            if (!category) {
                throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Categoría ${dto.categoryId} no encontrada`);
            }
        }
        const effectiveInputType = dto.inputType ?? setting.inputType;
        if (dto.value !== undefined) {
            this.validateValue(dto.value, effectiveInputType);
        }
        const isSensitive = setting.type === 'password' || dto.type === 'password';
        const before = { key: setting.key, value: isSensitive ? '***' : setting.value };
        Object.assign(setting, dto);
        const saved = await this.settingRepository.save(setting);
        await this.auditService.log({
            action: 'update',
            entity: 'Setting',
            entityId: saved.id,
            metadata: {
                before,
                after: { key: saved.key, value: isSensitive ? '***' : saved.value },
            },
        });
        return saved;
    }
    async remove(id) {
        const setting = await this.settingRepository.findOneBy({ id });
        if (!setting) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Setting ${id} no encontrado`);
        }
        if (setting.isProtected) {
            throw new common_1.ForbiddenException('Esta configuración está protegida y no puede eliminarse');
        }
        await this.auditService.log({
            action: 'delete',
            entity: 'Setting',
            entityId: id,
            metadata: { before: { key: setting.key } },
        });
        await this.settingRepository.remove(setting);
        return { message: `Setting '${setting.key}' eliminado correctamente` };
    }
    validateValue(value, inputType) {
        if (inputType === 'url' && value !== '') {
            try {
                new URL(value);
            }
            catch {
                throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, `El valor no es una URL válida`);
            }
        }
        if (inputType === 'email' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, `El valor no es un email válido`);
            }
        }
    }
    async resolveImageMeta(mediaId) {
        if (!mediaId)
            return null;
        try {
            const media = await this.mediaRepository.findOneBy({ id: mediaId });
            if (!media)
                return null;
            return { url: media.url, alt: media.alt };
        }
        catch {
            return null;
        }
    }
    async injectImageMeta(setting) {
        if (setting.inputType !== 'image' || !setting.value)
            return;
        const resolved = await this.resolveImageMeta(setting.value);
        if (!resolved)
            return;
        setting.meta = { ...(setting.meta ?? {}), ...resolved };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __param(1, (0, typeorm_1.InjectRepository)(setting_category_entity_1.SettingCategory)),
    __param(2, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService,
        permissions_service_1.PermissionsService])
], SettingsService);
const INPUT_TYPE_SCHEMAS = [
    {
        value: 'text',
        label: 'Texto corto',
        compatibleTypes: ['string'],
        meta: null,
    },
    {
        value: 'textarea',
        label: 'Texto largo',
        compatibleTypes: ['string'],
        meta: {
            rows: { type: 'number', required: false, description: 'Número de filas visibles' },
        },
    },
    {
        value: 'number',
        label: 'Número',
        compatibleTypes: ['number'],
        meta: {
            min: { type: 'number', required: false, description: 'Valor mínimo permitido' },
            max: { type: 'number', required: false, description: 'Valor máximo permitido' },
        },
    },
    {
        value: 'password',
        label: 'Contraseña',
        compatibleTypes: ['string', 'password'],
        meta: null,
    },
    {
        value: 'toggle',
        label: 'Toggle',
        compatibleTypes: ['boolean'],
        meta: null,
    },
    {
        value: 'checkbox',
        label: 'Checkbox',
        compatibleTypes: ['boolean', 'json'],
        meta: {
            options: {
                type: 'array',
                required: false,
                description: 'Opciones disponibles (solo si type es json para selección múltiple)',
                itemSchema: { value: 'string', label: 'string' },
            },
        },
    },
    {
        value: 'radio',
        label: 'Radio',
        compatibleTypes: ['string'],
        meta: {
            options: {
                type: 'array',
                required: true,
                description: 'Opciones disponibles',
                itemSchema: { value: 'string', label: 'string' },
            },
        },
    },
    {
        value: 'select',
        label: 'Select',
        compatibleTypes: ['string'],
        meta: {
            options: {
                type: 'array',
                required: true,
                description: 'Opciones disponibles',
                itemSchema: { value: 'string', label: 'string' },
            },
        },
    },
    {
        value: 'color',
        label: 'Color',
        compatibleTypes: ['string'],
        meta: null,
    },
    {
        value: 'url',
        label: 'URL',
        compatibleTypes: ['string'],
        meta: null,
    },
    {
        value: 'email',
        label: 'Email',
        compatibleTypes: ['string'],
        meta: null,
    },
    {
        value: 'date',
        label: 'Fecha',
        compatibleTypes: ['string'],
        meta: null,
    },
    {
        value: 'image',
        label: 'Imagen',
        compatibleTypes: ['string'],
        meta: null,
    },
];
//# sourceMappingURL=settings.service.js.map