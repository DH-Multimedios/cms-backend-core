import { SettingsService } from './settings.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
export declare class SettingCategoriesController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(page?: number, limit?: number): Promise<import("../..").PaginatedResult<import("../..").SettingCategory & {
        settingsCount: number;
    }>>;
    findOne(slug: string, page?: number, limit?: number): Promise<import("../..").SettingCategory & {
        settings: import("../..").Setting[];
        settingsTotal: number;
        settingsPage: number;
        settingsLimit: number;
        settingsPages: number;
    }>;
    create(dto: CreateCategoryDto): Promise<import("../..").SettingCategory>;
    reorder(dto: ReorderCategoriesDto): Promise<{
        message: string;
    }>;
    update(id: number, dto: UpdateCategoryDto): Promise<import("../..").SettingCategory>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=setting-categories.controller.d.ts.map