import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthConfig } from '../../core/interfaces/core-config.interface';
import { Session } from '../../database/entities/session.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { User } from '../../database/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionStrategy } from './strategies/session.strategy';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

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
