import { SettingCategory } from './setting-category.entity';
export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'password';
export type SettingInputType = 'text' | 'textarea' | 'number' | 'password' | 'toggle' | 'checkbox' | 'radio' | 'select' | 'color' | 'url' | 'email' | 'date' | 'image' | 'stringArray';
export interface SettingMeta {
    options?: Array<{
        value: string;
        label: string;
    }>;
    rows?: number;
    min?: number;
    max?: number;
    url?: string;
    alt?: string;
}
export declare class Setting {
    id: string;
    categoryId: number;
    category: SettingCategory;
    key: string;
    label: string;
    value: string;
    description: string;
    type: SettingType;
    inputType: SettingInputType;
    meta: SettingMeta | null;
    order: number;
    isProtected: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=setting.entity.d.ts.map