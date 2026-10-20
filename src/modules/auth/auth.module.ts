import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthConfig } from '../../core/interfaces/core-config.interface.js';
import { Session } from '../../database/entities/session.entity.js';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity.js';
import { User } from '../../database/entities/user.entity.js';
import { UsersModule } from '../users/users.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { SessionStrategy } from './strategies/session.strategy.js';
import { SessionAuthGuard } from './guards/session-auth.guard.js';
import { PermissionsGuard } from './guards/permissions.guard.js';

@Module({})
export class AuthModule {
  static register(authConfig: AuthConfig): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule,
        TypeOrmModule.forFeature([Session, PasswordResetToken, User]),
        UsersModule,
        AuditModule,
        NotificationsModule,
        SettingsModule,
      ],
      controllers: [AuthController],
      providers: [
        { provide: 'CORE_AUTH_CONFIG', useValue: authConfig },
        AuthService,
        LocalStrategy,
        SessionStrategy,
        SessionAuthGuard,
        PermissionsGuard,
      ],
      exports: [AuthService, SessionAuthGuard, PermissionsGuard, 'CORE_AUTH_CONFIG'],
    };
  }

  static registerAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => Promise<AuthConfig> | AuthConfig;
    inject?: any[];
  }): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        ...(options.imports || []),
        PassportModule,
        TypeOrmModule.forFeature([Session, PasswordResetToken, User]),
        UsersModule,
        AuditModule,
        NotificationsModule,
        SettingsModule,
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: 'CORE_AUTH_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        AuthService,
        LocalStrategy,
        SessionStrategy,
        SessionAuthGuard,
        PermissionsGuard,
      ],
      exports: [AuthService, SessionAuthGuard, PermissionsGuard, 'CORE_AUTH_CONFIG'],
    };
  }
}
