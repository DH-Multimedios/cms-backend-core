import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLayout } from '../../database/entities/email-layout.entity.js';
import { EmailTemplate } from '../../database/entities/email-template.entity.js';
import { NotificationType } from '../../database/entities/notification-type.entity.js';
import { UserNotificationPreference } from '../../database/entities/user-notification-preference.entity.js';
import { NotificationsService } from './notifications.service.js';
import { TemplateRendererService } from './template-renderer.service.js';
import { EmailSenderService } from './email-sender.service.js';
import { EmailLayoutsService } from './email-layouts/email-layouts.service.js';
import { EmailLayoutsController } from './email-layouts/email-layouts.controller.js';
import { EmailTemplatesService } from './email-templates/email-templates.service.js';
import { EmailTemplatesController } from './email-templates/email-templates.controller.js';
import { NotificationTypesService } from './notification-types/notification-types.service.js';
import { NotificationTypesController } from './notification-types/notification-types.controller.js';
import { NotificationPreferencesService } from './notification-preferences/notification-preferences.service.js';
import { NotificationPreferencesController } from './notification-preferences/notification-preferences.controller.js';
import { EmailProvidersModule } from '../email-providers/email-providers.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { SettingsModule } from '../settings/settings.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailLayout,
      EmailTemplate,
      NotificationType,
      UserNotificationPreference,
    ]),
    EmailProvidersModule,
    PermissionsModule,
    SettingsModule,
  ],
  controllers: [
    EmailLayoutsController,
    EmailTemplatesController,
    NotificationTypesController,
    NotificationPreferencesController,
  ],
  providers: [
    NotificationsService,
    TemplateRendererService,
    EmailSenderService,
    EmailLayoutsService,
    EmailTemplatesService,
    NotificationTypesService,
    NotificationPreferencesService,
  ],
  exports: [
    NotificationsService,
    EmailSenderService,
    NotificationTypesService,
  ],
})
export class NotificationsModule {}
