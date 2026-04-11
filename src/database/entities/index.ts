export { User } from './user.entity';
export { Role } from './role.entity';
export { Permission } from './permission.entity';
export { RefreshToken } from './refresh-token.entity';
export { AuditLog } from './audit-log.entity';
export { Taxonomy } from './taxonomy.entity';
export { File } from './file.entity';
export { Media } from './media.entity';
export { Setting } from './setting.entity';
export type { SettingType, SettingInputType, SettingMeta } from './setting.entity';
export { SettingCategory } from './setting-category.entity';
export { EmailProvider } from './email-provider.entity';
export type { EmailProviderType, EmailProviderConfigUnion, SmtpConfig, ResendConfig, GoogleOAuthConfig } from './email-provider.entity';
export { EmailLayout } from './email-layout.entity';
export type { EmailLayoutType } from './email-layout.entity';
export { EmailTemplate } from './email-template.entity';
export { NotificationType } from './notification-type.entity';
export { UserNotificationPreference } from './user-notification-preference.entity';
export type { Section, Column, Block, TextBlock, HeadingBlock, ButtonBlock, ImageBlock, DividerBlock, SpacerBlock } from './notification-block.types';

import { User } from './user.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { RefreshToken } from './refresh-token.entity';
import { AuditLog } from './audit-log.entity';
import { Taxonomy } from './taxonomy.entity';
import { File } from './file.entity';
import { Media } from './media.entity';
import { Setting } from './setting.entity';
import { SettingCategory } from './setting-category.entity';
import { EmailProvider } from './email-provider.entity';
import { EmailLayout } from './email-layout.entity';
import { EmailTemplate } from './email-template.entity';
import { NotificationType } from './notification-type.entity';
import { UserNotificationPreference } from './user-notification-preference.entity';

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
  RefreshToken,
  AuditLog,
  Taxonomy,
  File,
  Media,
  Setting,
  SettingCategory,
  EmailProvider,
  EmailLayout,
  EmailTemplate,
  NotificationType,
  UserNotificationPreference,
];
