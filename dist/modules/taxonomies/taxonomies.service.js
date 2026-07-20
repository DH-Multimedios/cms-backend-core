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
exports.TaxonomiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const taxonomy_entity_1 = require("../../database/entities/taxonomy.entity");
const entity_taxonomy_entity_1 = require("../../database/entities/entity-taxonomy.entity");
const permissions_service_1 = require("../permissions/permissions.service");
const audit_service_1 = require("../audit/audit.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const slug_util_1 = require("../../common/utils/slug.util");
let TaxonomiesService = class TaxonomiesService {
    taxonomyRepo;
    entityTaxonomyRepo;
    permissionsService;
    auditService;
    constructor(taxonomyRepo, entityTaxonomyRepo, permissionsService, auditService) {
        this.taxonomyRepo = taxonomyRepo;
        this.entityTaxonomyRepo = entityTaxonomyRepo;
        this.permissionsService = permissionsService;
        this.auditService = auditService;
    }
    async onModuleInit() {
        await this.permissionsService.registerPermissions([
            {
                name: 'taxonomies.create',
                description: 'Crear taxonomías',
                module: 'taxonomies',
                moduleName: 'Taxonomías',
            },
            {
                name: 'taxonomies.update',
                description: 'Editar y reordenar taxonomías',
                module: 'taxonomies',
                moduleName: 'Taxonomías',
            },
            {
                name: 'taxonomies.delete',
                description: 'Eliminar taxonomías',
                module: 'taxonomies',
                moduleName: 'Taxonomías',
            },
        ]);
    }
    async findAll(query) {
        const { type, parentId, root, search, page = 1, limit = 20 } = query;
        const qb = this.taxonomyRepo
            .createQueryBuilder('t')
            .addSelect((subquery) => subquery.select('COUNT(*)').from(taxonomy_entity_1.Taxonomy, 'child').where('child.parentId = t.id'), 't_childrenCount')
            .orderBy('t.order', 'ASC')
            .addOrderBy('t.name', 'ASC')
            .skip((page - 1) * limit)
            .take(limit);
        if (type) {
            qb.andWhere('t.type = :type', { type });
        }
        if (parentId) {
            qb.andWhere('t.parentId = :parentId', { parentId });
        }
        else if (root === 'true') {
            qb.andWhere('t.parentId IS NULL');
        }
        if (search) {
            qb.andWhere('(LOWER(t.name) LIKE :search OR LOWER(t.slug) LIKE :search)', {
                search: `%${search.toLowerCase()}%`,
            });
        }
        const [{ entities, raw }, total] = await Promise.all([
            qb.getRawAndEntities(),
            qb.clone().getCount(),
        ]);
        const items = entities.map((taxonomy, index) => Object.assign(taxonomy, { childrenCount: Number(raw[index].t_childrenCount) }));
        return {
            items,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const qb = this.taxonomyRepo
            .createQueryBuilder('t')
            .addSelect((subquery) => subquery.select('COUNT(*)').from(taxonomy_entity_1.Taxonomy, 'child').where('child.parentId = t.id'), 't_childrenCount')
            .where('t.id = :id', { id });
        const { entities, raw } = await qb.getRawAndEntities();
        const taxonomy = entities[0]
            ? Object.assign(entities[0], { childrenCount: Number(raw[0].t_childrenCount) })
            : null;
        if (!taxonomy) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía no encontrada');
        }
        return taxonomy;
    }
    async create(dto) {
        const slug = dto.slug ?? (0, slug_util_1.generateSlug)(dto.name);
        const existing = await this.taxonomyRepo.findOneBy({ slug });
        if (existing) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.TAXONOMY_SLUG_EXISTS, `El slug '${slug}' ya está en uso`);
        }
        if (dto.parentId) {
            const parent = await this.taxonomyRepo.findOneBy({ id: dto.parentId });
            if (!parent) {
                throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía padre no encontrada');
            }
        }
        const taxonomy = this.taxonomyRepo.create({ ...dto, slug });
        const saved = await this.taxonomyRepo.save(taxonomy);
        await this.auditService.log({
            action: 'create',
            entity: 'Taxonomy',
            entityId: saved.id,
            metadata: { after: { name: saved.name, slug: saved.slug, type: saved.type } },
        });
        return saved;
    }
    async update(id, dto) {
        const taxonomy = await this.taxonomyRepo.findOneBy({ id });
        if (!taxonomy) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía no encontrada');
        }
        const before = { name: taxonomy.name, slug: taxonomy.slug, type: taxonomy.type };
        if (dto.name && dto.name !== taxonomy.name && !dto.slug) {
            dto.slug = (0, slug_util_1.generateSlug)(dto.name);
        }
        if (dto.slug && dto.slug !== taxonomy.slug) {
            const conflict = await this.taxonomyRepo.findOneBy({ slug: dto.slug });
            if (conflict) {
                throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.TAXONOMY_SLUG_EXISTS, `El slug '${dto.slug}' ya está en uso`);
            }
        }
        if (dto.parentId) {
            if (dto.parentId === id) {
                throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.TAXONOMY_INVALID_PARENT, 'Una taxonomía no puede ser su propio padre');
            }
            const parent = await this.taxonomyRepo.findOneBy({ id: dto.parentId });
            if (!parent) {
                throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía padre no encontrada');
            }
        }
        Object.assign(taxonomy, dto);
        const saved = await this.taxonomyRepo.save(taxonomy);
        await this.auditService.log({
            action: 'update',
            entity: 'Taxonomy',
            entityId: id,
            metadata: { before, after: { name: saved.name, slug: saved.slug, type: saved.type } },
        });
        return saved;
    }
    async remove(id) {
        const taxonomy = await this.taxonomyRepo.findOneBy({ id });
        if (!taxonomy) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía no encontrada');
        }
        const childrenCount = await this.taxonomyRepo.countBy({ parentId: id });
        if (childrenCount > 0) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.TAXONOMY_HAS_CHILDREN, 'No se puede eliminar una taxonomía que tiene hijos — eliminá o reasigná los hijos primero');
        }
        await this.auditService.log({
            action: 'delete',
            entity: 'Taxonomy',
            entityId: id,
            metadata: { before: { name: taxonomy.name, slug: taxonomy.slug, type: taxonomy.type } },
        });
        await this.taxonomyRepo.remove(taxonomy);
        return { message: `Taxonomía '${taxonomy.name}' eliminada` };
    }
    async reorder(dto) {
        await Promise.all(dto.ids.map((id, index) => this.taxonomyRepo.update(id, { order: index })));
        return { message: 'Orden actualizado' };
    }
    async findForEntity(entityType, entityId) {
        const pivots = await this.entityTaxonomyRepo.find({
            where: { entityType, entityId },
            relations: { taxonomy: true },
            order: { taxonomy: { order: 'ASC', name: 'ASC' } },
        });
        return pivots.map((p) => p.taxonomy);
    }
    async syncEntity(entityType, entityId, taxonomyIds) {
        await this.entityTaxonomyRepo.delete({ entityType, entityId });
        if (taxonomyIds.length === 0)
            return;
        const pivots = taxonomyIds.map((taxonomyId) => this.entityTaxonomyRepo.create({ entityType, entityId, taxonomyId }));
        await this.entityTaxonomyRepo.save(pivots);
    }
    async detachAllFromEntity(entityType, entityId) {
        await this.entityTaxonomyRepo.delete({ entityType, entityId });
    }
};
exports.TaxonomiesService = TaxonomiesService;
exports.TaxonomiesService = TaxonomiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(taxonomy_entity_1.Taxonomy)),
    __param(1, (0, typeorm_1.InjectRepository)(entity_taxonomy_entity_1.EntityTaxonomy)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        permissions_service_1.PermissionsService,
        audit_service_1.AuditService])
], TaxonomiesService);
//# sourceMappingURL=taxonomies.service.js.map