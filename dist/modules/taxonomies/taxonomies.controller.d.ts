import { TaxonomiesService } from './taxonomies.service';
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto';
import { QueryTaxonomyDto } from './dto/query-taxonomy.dto';
import { ReorderTaxonomiesDto } from './dto/reorder-taxonomies.dto';
import { SyncEntityTaxonomiesDto } from './dto/sync-entity-taxonomies.dto';
export declare class TaxonomiesController {
    private readonly taxonomiesService;
    constructor(taxonomiesService: TaxonomiesService);
    findForEntity(entityType: string, entityId: string): Promise<import("../..").Taxonomy[]>;
    syncEntity(entityType: string, entityId: string, dto: SyncEntityTaxonomiesDto): Promise<void>;
    reorder(dto: ReorderTaxonomiesDto): Promise<{
        message: string;
    }>;
    findAll(query: QueryTaxonomyDto): Promise<import("../..").PaginatedResult<import("../..").Taxonomy & {
        childrenCount: number;
    }>>;
    findOne(id: string): Promise<import("../..").Taxonomy & {
        childrenCount: number;
    }>;
    create(dto: CreateTaxonomyDto): Promise<import("../..").Taxonomy>;
    update(id: string, dto: UpdateTaxonomyDto): Promise<import("../..").Taxonomy>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=taxonomies.controller.d.ts.map