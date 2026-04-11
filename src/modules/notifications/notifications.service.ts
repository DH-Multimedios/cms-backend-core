import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly settingsService: SettingsService,
    private readonly notifTypesService: NotificationTypesService,
    private readonly preferencesService: NotificationPreferencesService,
    private readonly templatesService: EmailTemplatesService,
    private readonly renderer: TemplateRendererService,
    private readonly sender: EmailSenderService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.permissionsService.registerPermissions([
      { name: 'notifications.manage', description: 'Gestionar tipos, templates y layouts de notificaciones', module: 'notifications' },
    ]);
  }

  // ─── Event listeners ────────────────────────────────────────────────────────

  @OnEvent('user.created', { async: true })
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    await this.dispatch('user.welcome', event.user.id, event.user.email, {
      firstName: event.user.firstName,
      verificationToken: event.verificationToken,
    });
  }

  @OnEvent('user.password-reset-requested', { async: true })
  async handlePasswordResetRequested(event: UserPasswordResetRequestedEvent): Promise<void> {
    await this.dispatch('user.password-reset', event.user.id, event.user.email, {
      firstName: event.user.firstName,
      resetToken: event.resetToken,
    });
  }

  @OnEvent('user.email-verification-requested', { async: true })
  async handleEmailVerificationRequested(event: UserEmailVerificationRequestedEvent): Promise<void> {
    await this.dispatch('user.email-verification', event.user.id, event.user.email, {
      firstName: event.user.firstName,
      verificationToken: event.verificationToken,
    });
  }

  // ─── Dispatch core ─────────────────────────────────────────────────────────

  /**
   * Verifica tipo habilitado + preferencia del usuario + template,
   * renderiza con variables globales + específicas, y envía.
   * Nunca lanza excepción — logea el error y sigue.
   */
  private async dispatch(
    notificationTypeKey: string,
    userId: string,
    recipientEmail: string,
    variables: Record<string, unknown>,
  ): Promise<void> {
    try {
      const notifType = await this.notifTypesService.findByKey(notificationTypeKey);
      if (!notifType?.isEnabled) {
        this.logger.debug(`Notificación '${notificationTypeKey}' desactivada globalmente`);
        return;
      }

      const userEnabled = await this.preferencesService.isEnabled(userId, notificationTypeKey);
      if (!userEnabled) {
        this.logger.debug(`Usuario ${userId} desactivó '${notificationTypeKey}'`);
        return;
      }

      const [entityType, notifType2] = notificationTypeKey.split('.');
      const template = await this.templatesService.findByType(entityType, notifType2);
      if (!template?.compiledHtml) {
        this.logger.warn(`No hay template compilado para '${notificationTypeKey}'`);
        return;
      }

      // Variables globales desde Settings — las específicas del evento tienen prioridad
      const globalVars = await this.getGlobalVariables();
      const allVars = { ...globalVars, ...variables };

      const subject = this.renderer.render(template.subject, allVars);
      const html = this.renderer.render(template.compiledHtml, allVars);

      await this.sender.send({ to: recipientEmail, subject, html });
    } catch (err) {
      this.logger.error(`Error despachando notificación '${notificationTypeKey}' para ${recipientEmail}`, err);
    }
  }

  /**
   * Obtiene las variables globales desde Settings.
   * Disponibles en todos los templates sin necesidad de pasarlas manualmente.
   *
   * Variables: appName, appUrl, appLogoUrl, currentYear
   */
  private async getGlobalVariables(): Promise<Record<string, unknown>> {
    const [appName, appUrl, appLogoUrl] = await Promise.all([
      this.settingsService.getValue('app.name', ''),
      this.settingsService.getValue('app.url', ''),
      this.settingsService.getValue('app.logoUrl', ''),
    ]);

    return {
      appName,
      appUrl,
      appLogoUrl,
      currentYear: new Date().getFullYear(),
    };
  }
}
