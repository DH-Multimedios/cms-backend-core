import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getInputTypeSchemas(): import("./settings.service").InputTypeSchema[];
    findOne(key: string): Promise<import("../..").Setting>;
    create(dto: CreateSettingDto): Promise<import("../..").Setting>;
    update(id: string, dto: UpdateSettingDto): Promise<import("../..").Setting>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=settings.controller.d.ts.map