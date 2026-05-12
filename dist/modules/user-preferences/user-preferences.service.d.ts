import { Repository } from 'typeorm';
import { UserPreference } from '../../database/entities/user-preference.entity';
import { BaseUserPreferencesService } from './base-user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
export declare class UserPreferencesService extends BaseUserPreferencesService<UserPreference> {
    constructor(repository: Repository<UserPreference>);
    updatePreferences(userId: string, dto: UpdateUserPreferenceDto): Promise<UserPreference>;
}
//# sourceMappingURL=user-preferences.service.d.ts.map