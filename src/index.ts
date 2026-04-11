// Core Module
export { CoreModule } from './core/core.module';

// Utils
export { generateSlug } from './common/utils/slug.util';

// Pagination
export { PaginationDto } from './common/dto/pagination.dto';
export type { PaginatedResult } from './common/interfaces/paginated-result.interface';

// Error handling & response
export { ApiException } from './common/exceptions/api.exception';
export { ErrorCode } from './common/enums/error-codes.enum';
export { HttpExceptionFilter } from './common/filters/http-exception.filter';
export { ResponseInterceptor } from './common/interceptors/response.interceptor';
export type { ApiResponse } from './common/interceptors/response.interceptor';

// Interfaces
export * from './core/interfaces/core-config.interface';

// Entities
export * from './database/entities';
export { CORE_ENTITIES } from './database/entities';

// Seeds
export { runCoreSeeds } from './database/seeds/core-seeds';

// Auth
export { AuthModule } from './modules/auth/auth.module';
export { AuthService } from './modules/auth/auth.service';
export { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
export { PermissionsGuard } from './modules/auth/guards/permissions.guard';
export { LocalAuthGuard } from './modules/auth/guards/local-auth.guard';
export { CurrentUser } from './modules/auth/decorators/current-user.decorator';
export { RequirePermissions } from './modules/auth/decorators/require-permissions.decorator';
export { Public } from './modules/auth/decorators/public.decorator';

// Users
export { UsersModule } from './modules/users/users.module';
export { UsersService } from './modules/users/users.service';
export { UserResponseDto } from './modules/users/dto/user-response.dto';
export { CreateUserDto } from './modules/users/dto/create-user.dto';
export { UpdateUserDto } from './modules/users/dto/update-user.dto';
export { UpdateProfileDto } from './modules/users/dto/update-profile.dto';

// Roles
export { RolesModule } from './modules/roles/roles.module';
export { RolesService } from './modules/roles/roles.service';

// Permissions
export { PermissionsModule } from './modules/permissions/permissions.module';
export { PermissionsService } from './modules/permissions/permissions.service';
export type { PermissionDefinition } from './modules/permissions/permissions.service';

// Audit
export { AuditModule } from './modules/audit/audit.module';
export { AuditService } from './modules/audit/audit.service';
export type { AuditLogOptions } from './modules/audit/audit.service';

// Settings
export { SettingsModule } from './modules/settings/settings.module';
export { SettingsService } from './modules/settings/settings.service';
export { CreateSettingDto } from './modules/settings/dto/create-setting.dto';
export { UpdateSettingDto } from './modules/settings/dto/update-setting.dto';
export { CreateCategoryDto } from './modules/settings/dto/create-category.dto';
export { UpdateCategoryDto } from './modules/settings/dto/update-category.dto';

// Taxonomies
export { TaxonomiesModule } from './modules/taxonomies/taxonomies.module';
export { TaxonomiesService } from './modules/taxonomies/taxonomies.service';
export { CreateTaxonomyDto } from './modules/taxonomies/dto/create-taxonomy.dto';
export { UpdateTaxonomyDto } from './modules/taxonomies/dto/update-taxonomy.dto';
export { QueryTaxonomyDto } from './modules/taxonomies/dto/query-taxonomy.dto';
export { SyncEntityTaxonomiesDto } from './modules/taxonomies/dto/sync-entity-taxonomies.dto';

// Email Providers
export { EmailProvidersModule } from './modules/email-providers/email-providers.module';
export { EmailProvidersService } from './modules/email-providers/email-providers.service';
export { CreateEmailProviderDto } from './modules/email-providers/dto/create-email-provider.dto';
export { UpdateEmailProviderDto } from './modules/email-providers/dto/update-email-provider.dto';

// Files
export { FilesModule } from './modules/files/files.module';
export { FilesService } from './modules/files/files.service';
export { UploadFileDto } from './modules/files/dto/upload-file.dto';
export { UpdateFileDto } from './modules/files/dto/update-file.dto';
export { ListFilesDto } from './modules/files/dto/list-files.dto';

// Media
export { MediaModule } from './modules/media/media.module';
export { MediaService } from './modules/media/media.service';
export { UploadMediaDto } from './modules/media/dto/upload-media.dto';
export { UpdateMediaDto } from './modules/media/dto/update-media.dto';
export { ListMediaDto } from './modules/media/dto/list-media.dto';

// Notifications
export { NotificationsModule } from './modules/notifications/notifications.module';
export { NotificationsService } from './modules/notifications/notifications.service';
