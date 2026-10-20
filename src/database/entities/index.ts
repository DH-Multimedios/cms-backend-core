export { User } from './user.entity.js';
export { Role } from './role.entity.js';
export { Permission } from './permission.entity.js';
export { Session } from './session.entity.js';
export { AuditLog } from './audit-log.entity.js';
export { Taxonomy } from './taxonomy.entity.js';
export { EntityTaxonomy } from './entity-taxonomy.entity.js';
export { File } from './file.entity.js';
export { Media } from './media.entity.js';
export { Setting } from './setting.entity.js';
export { SettingCategory } from './setting-category.entity.js';
export { EmailProvider } from './email-provider.entity.js';
export type {
  EmailProviderType,
  EmailProviderConfigUnion,
  SmtpConfig,
  ResendConfig,
  GoogleOAuthConfig,
} from './email-provider.entity.js';
export { EmailLayout } from './email-layout.entity.js';
export type { EmailLayoutType } from './email-layout.entity.js';
export { EmailTemplate } from './email-template.entity.js';
export { NotificationType } from './notification-type.entity.js';
export { UserNotificationPreference } from './user-notification-preference.entity.js';
export type {
  Section,
  Column,
  Block,
  TextBlock,
  HeadingBlock,
  ButtonBlock,
  ImageBlock,
  DividerBlock,
  SpacerBlock,
} from './notification-block.types.js';
export { UserPreference } from './user-preference.entity.js';
export type { ThemePreference } from './user-preference.entity.js';
export { PasswordResetToken } from './password-reset-token.entity.js';

import { User } from './user.entity.js';
import { Role } from './role.entity.js';
import { Permission } from './permission.entity.js';
import { Session } from './session.entity.js';
import { AuditLog } from './audit-log.entity.js';
import { Taxonomy } from './taxonomy.entity.js';
import { EntityTaxonomy } from './entity-taxonomy.entity.js';
import { File } from './file.entity.js';
import { Media } from './media.entity.js';
import { Setting } from './setting.entity.js';
import { SettingCategory } from './setting-category.entity.js';
import { EmailProvider } from './email-provider.entity.js';
import { EmailLayout } from './email-layout.entity.js';
import { EmailTemplate } from './email-template.entity.js';
import { NotificationType } from './notification-type.entity.js';
import { UserNotificationPreference } from './user-notification-preference.entity.js';
import { UserPreference } from './user-preference.entity.js';
import { PasswordResetToken } from './password-reset-token.entity.js';

/**
 * Array con todas las entidades del core.
 * Usarlo en el data-source.ts del cliente para no tener que listar entidades a mano:
 *
 * import { CORE_ENTITIES } from '@dh/backend-core';
 * entities: [...CORE_ENTITIES, ...misEntidades]
 */
export const CORE_ENTITIES = [
  User,
  Role,
  Permission,
  Session,
  AuditLog,
  Taxonomy,
  EntityTaxonomy,
  File,
  Media,
  Setting,
  SettingCategory,
  EmailProvider,
  EmailLayout,
  EmailTemplate,
  NotificationType,
  UserNotificationPreference,
  UserPreference,
  PasswordResetToken,
];
