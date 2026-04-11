import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLayout } from '../../database/entities/email-layout.entity';
import { EmailTemplate } from '../../database/entities/email-template.entity';
import { NotificationType } from '../../database/entities/notification-type.entity';
import { UserNotificationPreference } from '../../database/entities/user-notification-preference.entity';
import { NotificationsService } from './notifications.service';
import { TemplateRendererService } from './template-renderer.service';
import { EmailSenderService } from './email-sender.service';
import { EmailLayoutsService } from './email-layouts/email-layouts.service';
import { EmailLayoutsController } from './email-layouts/email-layouts.controller';
import { EmailTemplatesService } from './email-templates/email-templates.service';
import { EmailTemplatesController } from './email-templates/email-templates.controller';
import { NotificationTypesService } from './notification-types/notification-types.service';
import { NotificationTypesController } from './notification-types/notification-types.controller';
import { NotificationPreferencesService } from './notification-preferences/notification-preferences.service';
import { NotificationPreferencesController } from './notification-preferences/notification-preferences.controller';
import { EmailProvidersModule } from '../email-providers/email-providers.module';
import { PermissionsModule } from '../permissions/permissions.module';

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
