import { SettingType, SettingInputType, SettingMeta } from '../../../database/entities/setting.entity';
export declare class SettingMetaOptionDto {
    value: string;
    label: string;
}
export declare class SettingMetaDto {
    options?: SettingMetaOptionDto[];
    rows?: number;
    min?: number;
    max?: number;
}
export declare class CreateSettingDto {
    categoryId?: number;
    key: string;
    label: string;
    value: string;
    description?: string;
    type?: SettingType;
    inputType?: SettingInputType;
    meta?: SettingMeta | null;
    order?: number;
}
//# sourceMappingURL=create-setting.dto.d.ts.map