import { Repository } from 'typeorm';
import { UserNotificationPreference } from '../../../database/entities/user-notification-preference.entity';
import { NotificationType } from '../../../database/entities/notification-type.entity';
import { UpsertNotificationPreferenceDto } from './dto/upsert-notification-preference.dto';
export declare class NotificationPreferencesService {
    private readonly repository;
    private readonly notifTypeRepository;
    constructor(repository: Repository<UserNotificationPreference>, notifTypeRepository: Repository<NotificationType>);
    findForUser(userId: string): Promise<UserNotificationPreference[]>;
    upsert(userId: string, dto: UpsertNotificationPreferenceDto): Promise<UserNotificationPreference>;
    isEnabled(userId: string, notificationTypeKey: string): Promise<boolean>;
}
//# sourceMappingURL=notification-preferences.service.d.ts.map