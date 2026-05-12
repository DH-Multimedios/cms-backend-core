"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const email_layout_entity_1 = require("../../database/entities/email-layout.entity");
const email_template_entity_1 = require("../../database/entities/email-template.entity");
const notification_type_entity_1 = require("../../database/entities/notification-type.entity");
const user_notification_preference_entity_1 = require("../../database/entities/user-notification-preference.entity");
const notifications_service_1 = require("./notifications.service");
const template_renderer_service_1 = require("./template-renderer.service");
const email_sender_service_1 = require("./email-sender.service");
const email_layouts_service_1 = require("./email-layouts/email-layouts.service");
const email_layouts_controller_1 = require("./email-layouts/email-layouts.controller");
const email_templates_service_1 = require("./email-templates/email-templates.service");
const email_templates_controller_1 = require("./email-templates/email-templates.controller");
const notification_types_service_1 = require("./notification-types/notification-types.service");
const notification_types_controller_1 = require("./notification-types/notification-types.controller");
const notification_preferences_service_1 = require("./notification-preferences/notification-preferences.service");
const notification_preferences_controller_1 = require("./notification-preferences/notification-preferences.controller");
const email_providers_module_1 = require("../email-providers/email-providers.module");
const permissions_module_1 = require("../permissions/permissions.module");
const settings_module_1 = require("../settings/settings.module");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                email_layout_entity_1.EmailLayout,
                email_template_entity_1.EmailTemplate,
                notification_type_entity_1.NotificationType,
                user_notification_preference_entity_1.UserNotificationPreference,
            ]),
            email_providers_module_1.EmailProvidersModule,
            permissions_module_1.PermissionsModule,
            settings_module_1.SettingsModule,
        ],
        controllers: [
            email_layouts_controller_1.EmailLayoutsController,
            email_templates_controller_1.EmailTemplatesController,
            notification_types_controller_1.NotificationTypesController,
            notification_preferences_controller_1.NotificationPreferencesController,
        ],
        providers: [
            notifications_service_1.NotificationsService,
            template_renderer_service_1.TemplateRendererService,
            email_sender_service_1.EmailSenderService,
            email_layouts_service_1.EmailLayoutsService,
            email_templates_service_1.EmailTemplatesService,
            notification_types_service_1.NotificationTypesService,
            notification_preferences_service_1.NotificationPreferencesService,
        ],
        exports: [
            notifications_service_1.NotificationsService,
            email_sender_service_1.EmailSenderService,
            notification_types_service_1.NotificationTypesService,
        ],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map