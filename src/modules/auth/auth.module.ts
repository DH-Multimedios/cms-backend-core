import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthConfig } from '../../core/interfaces/core-config.interface';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { User } from '../../database/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({})
export class AuthModule {
  static register(authConfig: AuthConfig): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        PassportModule,
        JwtModule.register({
          secret: authConfig.jwtSecret,
          signOptions: { expiresIn: (authConfig.jwtExpiration || '15m') as any },
        }),
        TypeOrmModule.forFeature([RefreshToken, PasswordResetToken, User]),
        UsersModule,
        AuditModule,
        NotificationsModule,
      ],
      controllers: [AuthController],
      providers: [
        { provide: 'CORE_AUTH_CONFIG', useValue: authConfig },
        AuthService,
        LocalStrategy,
        JwtStrategy,
        JwtAuthGuard,
        PermissionsGuard,
      ],
      exports: [AuthService, JwtAuthGuard, PermissionsGuard, JwtModule, 'CORE_AUTH_CONFIG'],
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
        JwtModule.registerAsync({
          imports: options.imports,
          useFactory: async (...args: any[]) => {
            const authConfig = await options.useFactory(...args);
            return {
              secret: authConfig.jwtSecret,
              signOptions: { expiresIn: (authConfig.jwtExpiration || '15m') as any },
            };
          },
          inject: options.inject || [],
        }),
        TypeOrmModule.forFeature([RefreshToken, PasswordResetToken, User]),
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
        JwtStrategy,
        JwtAuthGuard,
        PermissionsGuard,
      ],
      exports: [AuthService, JwtAuthGuard, PermissionsGuard, JwtModule, 'CORE_AUTH_CONFIG'],
    };
  }
}
