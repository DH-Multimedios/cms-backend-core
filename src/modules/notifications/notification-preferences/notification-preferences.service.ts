import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotificationPreference } from '../../../database/entities/user-notification-preference.entity';
import { NotificationType } from '../../../database/entities/notification-type.entity';
import { UpsertNotificationPreferenceDto } from './dto/upsert-notification-preference.dto';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(UserNotificationPreference)
    private readonly repository: Repository<UserNotificationPreference>,
    @InjectRepository(NotificationType)
    private readonly notifTypeRepository: Repository<NotificationType>,
  ) {}

  async findForUser(userId: string): Promise<UserNotificationPreference[]> {
    return this.repository.findBy({ userId });
  }

  /**
   * Crea o actualiza la preferencia de un usuario para un tipo de notificación.
   */
  async upsert(userId: string, dto: UpsertNotificationPreferenceDto): Promise<UserNotificationPreference> {
    let preference = await this.repository.findOneBy({
      userId,
      notificationTypeKey: dto.notificationTypeKey,
    });

    if (preference) {
      preference.enabled = dto.enabled;
    } else {
      preference = this.repository.create({
        userId,
        notificationTypeKey: dto.notificationTypeKey,
        enabled: dto.enabled,
      });
    }

    return this.repository.save(preference);
  }

  /**
   * Verifica si un usuario tiene habilitado un tipo de notificación.
   * Si no tiene preferencia explícita, usa el defaultEnabled del tipo.
   */
  async isEnabled(userId: string, notificationTypeKey: string): Promise<boolean> {
    const preference = await this.repository.findOneBy({ userId, notificationTypeKey });

    if (preference) {
      return preference.enabled;
    }

    const notifType = await this.notifTypeRepository.findOneBy({ key: notificationTypeKey });
    return notifType?.defaultEnabled ?? true;
  }
}
