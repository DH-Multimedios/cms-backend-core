import { Injectable, OnModuleInit, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taxonomy } from '../../database/entities/taxonomy.entity';
import { EntityTaxonomy } from '../../database/entities/entity-taxonomy.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditService } from '../audit/audit.service';
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto';
import { QueryTaxonomyDto } from './dto/query-taxonomy.dto';
import { ReorderTaxonomiesDto } from './dto/reorder-taxonomies.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class TaxonomiesService implements OnModuleInit {
  constructor(
    @InjectRepository(Taxonomy)
    private readonly taxonomyRepo: Repository<Taxonomy>,
    @InjectRepository(EntityTaxonomy)
    private readonly entityTaxonomyRepo: Repository<EntityTaxonomy>,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.permissionsService.registerPermissions([
      { name: 'taxonomies.create', description: 'Crear taxonomías', module: 'taxonomies' },
      { name: 'taxonomies.update', description: 'Editar y reordenar taxonomías', module: 'taxonomies' },
      { name: 'taxonomies.delete', description: 'Eliminar taxonomías', module: 'taxonomies' },
    ]);
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  async findAll(query: QueryTaxonomyDto): Promise<PaginatedResult<Taxonomy & { childrenCount: number }>> {
    const { type, parentId, root, search, page = 1, limit = 20 } = query;

    const qb = this.taxonomyRepo
      .createQueryBuilder('t')
      .loadRelationCountAndMap('t.childrenCount', 't.children')
      .orderBy('t.order', 'ASC')
      .addOrderBy('t.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (type) {
      qb.andWhere('t.type = :type', { type });
    }

    if (parentId) {
      qb.andWhere('t.parentId = :parentId', { parentId });
    } else if (root === 'true') {
      qb.andWhere('t.parentId IS NULL');
    }

    if (search) {
      qb.andWhere('(LOWER(t.name) LIKE :search OR LOWER(t.slug) LIKE :search)', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items as (Taxonomy & { childrenCount: number })[],
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Taxonomy & { childrenCount: number }> {
    const qb = this.taxonomyRepo
      .createQueryBuilder('t')
      .loadRelationCountAndMap('t.childrenCount', 't.children')
      .where('t.id = :id', { id });

    const taxonomy = await qb.getOne();
    if (!taxonomy) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía no encontrada');
    }
    return taxonomy as Taxonomy & { childrenCount: number };
  }

  async create(dto: CreateTaxonomyDto): Promise<Taxonomy> {
    const slug = dto.slug ?? generateSlug(dto.name);

    const existing = await this.taxonomyRepo.findOneBy({ slug });
    if (existing) {
      throw new ApiException(HttpStatus.CONFLICT, ErrorCode.TAXONOMY_SLUG_EXISTS, `El slug '${slug}' ya está en uso`);
    }

    if (dto.parentId) {
      const parent = await this.taxonomyRepo.findOneBy({ id: dto.parentId });
      if (!parent) {
        throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía padre no encontrada');
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

  async update(id: string, dto: UpdateTaxonomyDto): Promise<Taxonomy> {
    const taxonomy = await this.taxonomyRepo.findOneBy({ id });
    if (!taxonomy) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía no encontrada');
    }

    const before = { name: taxonomy.name, slug: taxonomy.slug, type: taxonomy.type };

    if (dto.name && dto.name !== taxonomy.name && !dto.slug) {
      dto.slug = generateSlug(dto.name);
    }

    if (dto.slug && dto.slug !== taxonomy.slug) {
      const conflict = await this.taxonomyRepo.findOneBy({ slug: dto.slug });
      if (conflict) {
        throw new ApiException(HttpStatus.CONFLICT, ErrorCode.TAXONOMY_SLUG_EXISTS, `El slug '${dto.slug}' ya está en uso`);
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.TAXONOMY_INVALID_PARENT, 'Una taxonomía no puede ser su propio padre');
      }
      const parent = await this.taxonomyRepo.findOneBy({ id: dto.parentId });
      if (!parent) {
        throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía padre no encontrada');
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

  async remove(id: string): Promise<{ message: string }> {
    const taxonomy = await this.taxonomyRepo.findOneBy({ id });
    if (!taxonomy) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.TAXONOMY_NOT_FOUND, 'Taxonomía no encontrada');
    }

    const childrenCount = await this.taxonomyRepo.countBy({ parentId: id });
    if (childrenCount > 0) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.TAXONOMY_HAS_CHILDREN,
        'No se puede eliminar una taxonomía que tiene hijos — eliminá o reasigná los hijos primero',
      );
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

  async reorder(dto: ReorderTaxonomiesDto): Promise<{ message: string }> {
    await Promise.all(
      dto.ids.map((id, index) => this.taxonomyRepo.update(id, { order: index })),
    );
    return { message: 'Orden actualizado' };
  }

  // ─── Entity associations ───────────────────────────────────────────────────

  /**
   * Devuelve todas las taxonomías asociadas a una entidad.
   * Uso en servicios cliente: await this.taxonomiesService.findForEntity('Product', product.id)
   */
  async findForEntity(entityType: string, entityId: string): Promise<Taxonomy[]> {
    const pivots = await this.entityTaxonomyRepo.find({
      where: { entityType, entityId },
      relations: ['taxonomy'],
      order: { taxonomy: { order: 'ASC', name: 'ASC' } },
    });
    return pivots.map((p) => p.taxonomy);
  }

  /**
   * Reemplaza completamente las taxonomías de una entidad.
   * Es idempotente — seguro llamarlo en cada update del cliente.
   * Uso: await this.taxonomiesService.syncEntity('Product', product.id, dto.categoryIds)
   */
  async syncEntity(entityType: string, entityId: string, taxonomyIds: string[]): Promise<void> {
    await this.entityTaxonomyRepo.delete({ entityType, entityId });

    if (taxonomyIds.length === 0) return;

    const pivots = taxonomyIds.map((taxonomyId) =>
      this.entityTaxonomyRepo.create({ entityType, entityId, taxonomyId }),
    );
    await this.entityTaxonomyRepo.save(pivots);
  }

  /**
   * Elimina todas las taxonomías de una entidad.
   * Llamar en el delete del cliente para no dejar huérfanos.
   */
  async detachAllFromEntity(entityType: string, entityId: string): Promise<void> {
    await this.entityTaxonomyRepo.delete({ entityType, entityId });
  }
}
