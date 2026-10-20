// Core Module
export { CoreModule } from './core/core.module.js';

// Utils
export { generateSlug } from './common/utils/slug.util.js';

// Pagination
export { PaginationDto } from './common/dto/pagination.dto.js';
export type { PaginatedResult } from './common/interfaces/paginated-result.interface.js';

// Error handling & response
export { ApiException } from './common/exceptions/api.exception.js';
export { ErrorCode } from './common/enums/error-codes.enum.js';
export { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
export { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
export type { ApiResponse } from './common/interceptors/response.interceptor.js';

// Interfaces
export * from './core/interfaces/core-config.interface.js';

// Entities
export * from './database/entities/index.js';
export { CORE_ENTITIES } from './database/entities/index.js';

// Seeds
export { runCoreSeeds } from './database/seeds/core-seeds.js';
export type { ExtraRole, CoreSeedOptions } from './database/seeds/core-seeds.js';

// Auth
export { AuthModule } from './modules/auth/auth.module.js';
export { AuthService } from './modules/auth/auth.service.js';
export { SessionAuthGuard } from './modules/auth/guards/session-auth.guard.js';
export { PermissionsGuard } from './modules/auth/guards/permissions.guard.js';
export { LocalAuthGuard } from './modules/auth/guards/local-auth.guard.js';
export { CurrentUser } from './modules/auth/decorators/current-user.decorator.js';
export { RequirePermissions } from './modules/auth/decorators/require-permissions.decorator.js';
export { Public } from './modules/auth/decorators/public.decorator.js';

// Users
export { UsersModule } from './modules/users/users.module.js';
export { UsersService } from './modules/users/users.service.js';
export { UserCreatedEvent } from './modules/users/events/user-created.event.js';
export { UserResponseDto } from './modules/users/dto/user-response.dto.js';
export { CreateUserDto } from './modules/users/dto/create-user.dto.js';
export { UpdateUserDto } from './modules/users/dto/update-user.dto.js';
export { UpdateProfileDto } from './modules/users/dto/update-profile.dto.js';

// Roles
export { RolesModule } from './modules/roles/roles.module.js';
export { RolesService } from './modules/roles/roles.service.js';

// Permissions
export { PermissionsModule } from './modules/permissions/permissions.module.js';
export { PermissionsService } from './modules/permissions/permissions.service.js';
export type { PermissionDefinition } from './modules/permissions/permissions.service.js';

// Audit
export { AuditModule } from './modules/audit/audit.module.js';
export { AuditService } from './modules/audit/audit.service.js';
export type { AuditLogOptions } from './modules/audit/audit.service.js';

// Settings
export { SettingsModule } from './modules/settings/settings.module.js';
export { SettingsService } from './modules/settings/settings.service.js';
export { CreateSettingDto } from './modules/settings/dto/create-setting.dto.js';
export { UpdateSettingDto } from './modules/settings/dto/update-setting.dto.js';
export { CreateCategoryDto } from './modules/settings/dto/create-category.dto.js';
export { UpdateCategoryDto } from './modules/settings/dto/update-category.dto.js';

// Taxonomies
export { TaxonomiesModule } from './modules/taxonomies/taxonomies.module.js';
export { TaxonomiesService } from './modules/taxonomies/taxonomies.service.js';
export { CreateTaxonomyDto } from './modules/taxonomies/dto/create-taxonomy.dto.js';
export { UpdateTaxonomyDto } from './modules/taxonomies/dto/update-taxonomy.dto.js';
export { QueryTaxonomyDto } from './modules/taxonomies/dto/query-taxonomy.dto.js';
export { SyncEntityTaxonomiesDto } from './modules/taxonomies/dto/sync-entity-taxonomies.dto.js';

// Email Providers
export { EmailProvidersModule } from './modules/email-providers/email-providers.module.js';
export { EmailProvidersService } from './modules/email-providers/email-providers.service.js';
export { CreateEmailProviderDto } from './modules/email-providers/dto/create-email-provider.dto.js';
export { UpdateEmailProviderDto } from './modules/email-providers/dto/update-email-provider.dto.js';

// Files
export { FilesModule } from './modules/files/files.module.js';
export { FilesService } from './modules/files/files.service.js';
export { UploadFileDto } from './modules/files/dto/upload-file.dto.js';
export { UpdateFileDto } from './modules/files/dto/update-file.dto.js';
export { ListFilesDto } from './modules/files/dto/list-files.dto.js';

// Media
export { MediaModule } from './modules/media/media.module.js';
export { MediaService } from './modules/media/media.service.js';
export { UploadMediaDto } from './modules/media/dto/upload-media.dto.js';
export { UpdateMediaDto } from './modules/media/dto/update-media.dto.js';
export { ListMediaDto } from './modules/media/dto/list-media.dto.js';

// Notifications
export { NotificationsModule } from './modules/notifications/notifications.module.js';
export { NotificationsService } from './modules/notifications/notifications.service.js';

// User Preferences
export { UserPreferencesModule } from './modules/user-preferences/user-preferences.module.js';
export { UserPreferencesService } from './modules/user-preferences/user-preferences.service.js';
export { BaseUserPreferencesService } from './modules/user-preferences/base-user-preferences.service.js';
export { UpdateUserPreferenceDto } from './modules/user-preferences/dto/update-user-preference.dto.js';
export type { ThemePreference } from './database/entities/user-preference.entity.js';
export { UserPreference } from './database/entities/user-preference.entity.js';
