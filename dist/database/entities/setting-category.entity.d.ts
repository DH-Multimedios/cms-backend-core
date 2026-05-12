import { Setting } from './setting.entity';
export declare class SettingCategory {
    id: number;
    slug: string;
    label: string;
    description: string;
    order: number;
    isProtected: boolean;
    settings: Setting[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=setting-category.entity.d.ts.map