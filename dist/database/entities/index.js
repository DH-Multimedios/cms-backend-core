"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CORE_ENTITIES = exports.PasswordResetToken = exports.UserPreference = exports.UserNotificationPreference = exports.NotificationType = exports.EmailTemplate = exports.EmailLayout = exports.EmailProvider = exports.SettingCategory = exports.Setting = exports.Media = exports.File = exports.EntityTaxonomy = exports.Taxonomy = exports.AuditLog = exports.Session = exports.Permission = exports.Role = exports.User = void 0;
var user_entity_1 = require("./user.entity");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_entity_1.User; } });
var role_entity_1 = require("./role.entity");
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return role_entity_1.Role; } });
var permission_entity_1 = require("./permission.entity");
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return permission_entity_1.Permission; } });
var session_entity_1 = require("./session.entity");
Object.defineProperty(exports, "Session", { enumerable: true, get: function () { return session_entity_1.Session; } });
var audit_log_entity_1 = require("./audit-log.entity");
Object.defineProperty(exports, "AuditLog", { enumerable: true, get: function () { return audit_log_entity_1.AuditLog; } });
var taxonomy_entity_1 = require("./taxonomy.entity");
Object.defineProperty(exports, "Taxonomy", { enumerable: true, get: function () { return taxonomy_entity_1.Taxonomy; } });
var entity_taxonomy_entity_1 = require("./entity-taxonomy.entity");
Object.defineProperty(exports, "EntityTaxonomy", { enumerable: true, get: function () { return entity_taxonomy_entity_1.EntityTaxonomy; } });
var file_entity_1 = require("./file.entity");
Object.defineProperty(exports, "File", { enumerable: true, get: function () { return file_entity_1.File; } });
var media_entity_1 = require("./media.entity");
Object.defineProperty(exports, "Media", { enumerable: true, get: function () { return media_entity_1.Media; } });
var setting_entity_1 = require("./setting.entity");
Object.defineProperty(exports, "Setting", { enumerable: true, get: function () { return setting_entity_1.Setting; } });
var setting_category_entity_1 = require("./setting-category.entity");
Object.defineProperty(exports, "SettingCategory", { enumerable: true, get: function () { return setting_category_entity_1.SettingCategory; } });
var email_provider_entity_1 = require("./email-provider.entity");
Object.defineProperty(exports, "EmailProvider", { enumerable: true, get: function () { return email_provider_entity_1.EmailProvider; } });
var email_layout_entity_1 = require("./email-layout.entity");
Object.defineProperty(exports, "EmailLayout", { enumerable: true, get: function () { return email_layout_entity_1.EmailLayout; } });
var email_template_entity_1 = require("./email-template.entity");
Object.defineProperty(exports, "EmailTemplate", { enumerable: true, get: function () { return email_template_entity_1.EmailTemplate; } });
var notification_type_entity_1 = require("./notification-type.entity");
Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function () { return notification_type_entity_1.NotificationType; } });
var user_notification_preference_entity_1 = require("./user-notification-preference.entity");
Object.defineProperty(exports, "UserNotificationPreference", { enumerable: true, get: function () { return user_notification_preference_entity_1.UserNotificationPreference; } });
var user_preference_entity_1 = require("./user-preference.entity");
Object.defineProperty(exports, "UserPreference", { enumerable: true, get: function () { return user_preference_entity_1.UserPreference; } });
var password_reset_token_entity_1 = require("./password-reset-token.entity");
Object.defineProperty(exports, "PasswordResetToken", { enumerable: true, get: function () { return password_reset_token_entity_1.PasswordResetToken; } });
const user_entity_2 = require("./user.entity");
const role_entity_2 = require("./role.entity");
const permission_entity_2 = require("./permission.entity");
const session_entity_2 = require("./session.entity");
const audit_log_entity_2 = require("./audit-log.entity");
const taxonomy_entity_2 = require("./taxonomy.entity");
const entity_taxonomy_entity_2 = require("./entity-taxonomy.entity");
const file_entity_2 = require("./file.entity");
const media_entity_2 = require("./media.entity");
const setting_entity_2 = require("./setting.entity");
const setting_category_entity_2 = require("./setting-category.entity");
const email_provider_entity_2 = require("./email-provider.entity");
const email_layout_entity_2 = require("./email-layout.entity");
const email_template_entity_2 = require("./email-template.entity");
const notification_type_entity_2 = require("./notification-type.entity");
const user_notification_preference_entity_2 = require("./user-notification-preference.entity");
const user_preference_entity_2 = require("./user-preference.entity");
const password_reset_token_entity_2 = require("./password-reset-token.entity");
exports.CORE_ENTITIES = [
    user_entity_2.User,
    role_entity_2.Role,
    permission_entity_2.Permission,
    session_entity_2.Session,
    audit_log_entity_2.AuditLog,
    taxonomy_entity_2.Taxonomy,
    entity_taxonomy_entity_2.EntityTaxonomy,
    file_entity_2.File,
    media_entity_2.Media,
    setting_entity_2.Setting,
    setting_category_entity_2.SettingCategory,
    email_provider_entity_2.EmailProvider,
    email_layout_entity_2.EmailLayout,
    email_template_entity_2.EmailTemplate,
    notification_type_entity_2.NotificationType,
    user_notification_preference_entity_2.UserNotificationPreference,
    user_preference_entity_2.UserPreference,
    password_reset_token_entity_2.PasswordResetToken,
];
//# sourceMappingURL=index.js.map