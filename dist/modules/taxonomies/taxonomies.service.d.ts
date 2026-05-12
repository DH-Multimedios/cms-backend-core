import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Taxonomy } from '../../database/entities/taxonomy.entity';
import { EntityTaxonomy } from '../../database/entities/entity-taxonomy.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditService } from '../audit/audit.service';
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto';
import { QueryTaxonomyDto } from './dto/query-taxonomy.dto';
import { ReorderTaxonomiesDto } from './dto/reorder-taxonomies.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
export declare class TaxonomiesService implements OnModuleInit {
    private readonly taxonomyRepo;
    private readonly entityTaxonomyRepo;
    private readonly permissionsService;
    private readonly auditService;
    constructor(taxonomyRepo: Repository<Taxonomy>, entityTaxonomyRepo: Repository<EntityTaxonomy>, permissionsService: PermissionsService, auditService: AuditService);
    onModuleInit(): Promise<void>;
    findAll(query: QueryTaxonomyDto): Promise<PaginatedResult<Taxonomy & {
        childrenCount: number;
    }>>;
    findOne(id: string): Promise<Taxonomy & {
        childrenCount: number;
    }>;
    create(dto: CreateTaxonomyDto): Promise<Taxonomy>;
    update(id: string, dto: UpdateTaxonomyDto): Promise<Taxonomy>;
    remove(id: string): Promise<{
        message: string;
    }>;
    reorder(dto: ReorderTaxonomiesDto): Promise<{
        message: string;
    }>;
    findForEntity(entityType: string, entityId: string): Promise<Taxonomy[]>;
    syncEntity(entityType: string, entityId: string, taxonomyIds: string[]): Promise<void>;
    detachAllFromEntity(entityType: string, entityId: string): Promise<void>;
}
//# sourceMappingURL=taxonomies.service.d.ts.map