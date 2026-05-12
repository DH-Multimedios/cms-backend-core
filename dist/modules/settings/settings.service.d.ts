import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Setting, SettingInputType, SettingType } from '../../database/entities/setting.entity';
import { SettingCategory } from '../../database/entities/setting-category.entity';
import { Media } from '../../database/entities/media.entity';
import { AuditService } from '../audit/audit.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { SettingsQueryDto } from './dto/settings-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
export declare class SettingsService implements OnModuleInit {
    private readonly settingRepository;
    private readonly categoryRepository;
    private readonly mediaRepository;
    private readonly auditService;
    private readonly permissionsService;
    constructor(settingRepository: Repository<Setting>, categoryRepository: Repository<SettingCategory>, mediaRepository: Repository<Media>, auditService: AuditService, permissionsService: PermissionsService);
    getInputTypeSchemas(): InputTypeSchema[];
    onModuleInit(): Promise<void>;
    findAllCategories(page?: number, limit?: number): Promise<PaginatedResult<SettingCategory & {
        settingsCount: number;
    }>>;
    findCategoryBySlug(slug: string, page?: number, limit?: number): Promise<SettingCategory & {
        settings: Setting[];
        settingsTotal: number;
        settingsPage: number;
        settingsLimit: number;
        settingsPages: number;
    }>;
    createCategory(dto: CreateCategoryDto): Promise<SettingCategory>;
    updateCategory(id: number, dto: UpdateCategoryDto): Promise<SettingCategory>;
    reorderCategories(dto: ReorderCategoriesDto): Promise<{
        message: string;
    }>;
    removeCategory(id: number): Promise<{
        message: string;
    }>;
    findAll(query: SettingsQueryDto): Promise<Setting[]>;
    findByKey(key: string): Promise<Setting>;
    getValue(key: string, defaultValue?: string): Promise<string | undefined>;
    create(dto: CreateSettingDto): Promise<Setting>;
    update(id: string, dto: UpdateSettingDto): Promise<Setting>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private validateValue;
    private resolveImageMeta;
    private injectImageMeta;
}
export interface MetaFieldSchema {
    type: 'string' | 'number' | 'array';
    required: boolean;
    description: string;
    itemSchema?: Record<string, string>;
}
export interface InputTypeSchema {
    value: SettingInputType;
    label: string;
    compatibleTypes: SettingType[];
    meta: Record<string, MetaFieldSchema> | null;
}
//# sourceMappingURL=settings.service.d.ts.map