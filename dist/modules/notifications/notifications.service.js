"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const permissions_service_1 = require("../permissions/permissions.service");
const settings_service_1 = require("../settings/settings.service");
const notification_types_service_1 = require("./notification-types/notification-types.service");
const notification_preferences_service_1 = require("./notification-preferences/notification-preferences.service");
const email_templates_service_1 = require("./email-templates/email-templates.service");
const template_renderer_service_1 = require("./template-renderer.service");
const email_sender_service_1 = require("./email-sender.service");
const user_created_event_1 = require("../users/events/user-created.event");
const user_password_reset_requested_event_1 = require("../users/events/user-password-reset-requested.event");
const user_email_verification_requested_event_1 = require("../users/events/user-email-verification-requested.event");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    permissionsService;
    settingsService;
    notifTypesService;
    preferencesService;
    templatesService;
    renderer;
    sender;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(permissionsService, settingsService, notifTypesService, preferencesService, templatesService, renderer, sender) {
        this.permissionsService = permissionsService;
        this.settingsService = settingsService;
        this.notifTypesService = notifTypesService;
        this.preferencesService = preferencesService;
        this.templatesService = templatesService;
        this.renderer = renderer;
        this.sender = sender;
    }
    async onModuleInit() {
        await this.permissionsService.registerPermissions([
            {
                name: 'notifications.manage',
                description: 'Gestionar tipos, templates y layouts de notificaciones',
                module: 'notifications',
                moduleName: 'Notificaciones',
            },
        ]);
    }
    async handleUserCreated(event) {
        await this.dispatch('user.welcome', event.user.id, event.user.email, {
            firstName: event.user.firstName,
        });
    }
    async handlePasswordResetRequested(event) {
        await this.dispatch('user.password-reset', event.user.id, event.user.email, {
            firstName: event.user.firstName,
            resetToken: event.resetToken,
        });
    }
    async handleEmailVerificationRequested(event) {
        await this.dispatch('user.email-verification', event.user.id, event.user.email, {
            firstName: event.user.firstName,
            verificationToken: event.verificationToken,
        });
    }
    async dispatch(notificationTypeKey, userId, recipientEmail, variables) {
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
            const template = await this.resolveTemplate(entityType, notifType2, notificationTypeKey);
            if (!template)
                return;
            const globalVars = await this.getGlobalVariables();
            const allVars = { ...globalVars, ...variables };
            const subject = this.renderer.render(template.subject, allVars);
            const html = this.renderer.render(template.compiledHtml, allVars);
            await this.sender.send({ to: recipientEmail, subject, html });
        }
        catch (err) {
            this.logger.error(`Error despachando notificación '${notificationTypeKey}' para ${recipientEmail}`, err);
        }
    }
    async resolveTemplate(entityType, notifType, key) {
        let template = await this.templatesService.findByType(entityType, notifType);
        if (!template) {
            this.logger.warn(`No existe template para '${key}'`);
            return null;
        }
        if (!template.compiledHtml) {
            this.logger.debug(`Compilando template '${key}' por primera vez`);
            template = await this.templatesService.compileAndSave(template);
        }
        if (!template.compiledHtml) {
            this.logger.warn(`No se pudo compilar template para '${key}'`);
            return null;
        }
        return template;
    }
    async getGlobalVariables() {
        const [appName, appUrl, appLogoUrl] = await Promise.all([
            this.settingsService.getValue('app.name', ''),
            this.settingsService.getValue('app.url', ''),
            this.settingsService.getValue('app.logo', ''),
        ]);
        return {
            appName,
            appUrl,
            appLogoUrl,
            currentYear: new Date().getFullYear(),
        };
    }
    async sendEmail(options) {
        await this.sender.send(options);
    }
    async notifySystem(notificationTypeKey, recipientEmail, variables) {
        try {
            const notifType = await this.notifTypesService.findByKey(notificationTypeKey);
            if (!notifType?.isEnabled) {
                this.logger.debug(`Notificación '${notificationTypeKey}' desactivada globalmente`);
                return;
            }
            const [entityType, type] = notificationTypeKey.split('.');
            const template = await this.resolveTemplate(entityType, type, notificationTypeKey);
            if (!template)
                return;
            const globalVars = await this.getGlobalVariables();
            const allVars = { ...globalVars, ...variables };
            const subject = this.renderer.render(template.subject, allVars);
            const html = this.renderer.render(template.compiledHtml, allVars);
            await this.sender.send({ to: recipientEmail, subject, html });
        }
        catch (err) {
            this.logger.error(`Error despachando notificación de sistema '${notificationTypeKey}' para ${recipientEmail}`, err);
        }
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, event_emitter_1.OnEvent)('user.created', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_created_event_1.UserCreatedEvent]),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "handleUserCreated", null);
__decorate([
    (0, event_emitter_1.OnEvent)('user.password-reset-requested', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_password_reset_requested_event_1.UserPasswordResetRequestedEvent]),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "handlePasswordResetRequested", null);
__decorate([
    (0, event_emitter_1.OnEvent)('user.email-verification-requested', { async: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_email_verification_requested_event_1.UserEmailVerificationRequestedEvent]),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "handleEmailVerificationRequested", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService,
        settings_service_1.SettingsService,
        notification_types_service_1.NotificationTypesService,
        notification_preferences_service_1.NotificationPreferencesService,
        email_templates_service_1.EmailTemplatesService,
        template_renderer_service_1.TemplateRendererService,
        email_sender_service_1.EmailSenderService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map