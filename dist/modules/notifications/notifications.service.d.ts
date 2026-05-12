import { OnModuleInit } from '@nestjs/common';
import { PermissionsService } from '../permissions/permissions.service';
import { SettingsService } from '../settings/settings.service';
import { NotificationTypesService } from './notification-types/notification-types.service';
import { NotificationPreferencesService } from './notification-preferences/notification-preferences.service';
import { EmailTemplatesService } from './email-templates/email-templates.service';
import { TemplateRendererService } from './template-renderer.service';
import { EmailSenderService } from './email-sender.service';
import { UserCreatedEvent } from '../users/events/user-created.event';
import { UserPasswordResetRequestedEvent } from '../users/events/user-password-reset-requested.event';
import { UserEmailVerificationRequestedEvent } from '../users/events/user-email-verification-requested.event';
export declare class NotificationsService implements OnModuleInit {
    private readonly permissionsService;
    private readonly settingsService;
    private readonly notifTypesService;
    private readonly preferencesService;
    private readonly templatesService;
    private readonly renderer;
    private readonly sender;
    private readonly logger;
    constructor(permissionsService: PermissionsService, settingsService: SettingsService, notifTypesService: NotificationTypesService, preferencesService: NotificationPreferencesService, templatesService: EmailTemplatesService, renderer: TemplateRendererService, sender: EmailSenderService);
    onModuleInit(): Promise<void>;
    handleUserCreated(event: UserCreatedEvent): Promise<void>;
    handlePasswordResetRequested(event: UserPasswordResetRequestedEvent): Promise<void>;
    handleEmailVerificationRequested(event: UserEmailVerificationRequestedEvent): Promise<void>;
    private dispatch;
    private resolveTemplate;
    private getGlobalVariables;
    sendEmail(options: {
        to: string;
        subject: string;
        html: string;
    }): Promise<void>;
    notifySystem(notificationTypeKey: string, recipientEmail: string, variables: Record<string, unknown>): Promise<void>;
}
//# sourceMappingURL=notifications.service.d.ts.map