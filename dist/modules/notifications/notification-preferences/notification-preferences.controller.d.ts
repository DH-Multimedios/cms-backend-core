import { NotificationPreferencesService } from './notification-preferences.service';
import { UpsertNotificationPreferenceDto } from './dto/upsert-notification-preference.dto';
import { User } from '../../../database/entities/user.entity';
export declare class NotificationPreferencesController {
    private readonly service;
    constructor(service: NotificationPreferencesService);
    findMine(user: User): Promise<import("../../..").UserNotificationPreference[]>;
    upsert(user: User, dto: UpsertNotificationPreferenceDto): Promise<import("../../..").UserNotificationPreference>;
}
//# sourceMappingURL=notification-preferences.controller.d.ts.map