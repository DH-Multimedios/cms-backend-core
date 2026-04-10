// Core Module
export { CoreModule } from './core/core.module';

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
