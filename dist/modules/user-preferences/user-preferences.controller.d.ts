import { UserPreferencesService } from './user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { User } from '../../database/entities/user.entity';
export declare class UserPreferencesController {
    private readonly service;
    constructor(service: UserPreferencesService);
    findMine(user: User): Promise<import("../..").UserPreference>;
    updateMine(user: User, dto: UpdateUserPreferenceDto): Promise<import("../..").UserPreference>;
}
//# sourceMappingURL=user-preferences.controller.d.ts.map