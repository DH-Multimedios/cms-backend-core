import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Session } from '../../database/entities/session.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { AuthConfig } from '../../core/interfaces/core-config.interface';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';
import { AuthResponseDto } from './dto/auth-response.dto';
export declare class AuthService {
    private readonly authConfig;
    private readonly usersService;
    private readonly auditService;
    private readonly notificationsService;
    private readonly settingsService;
    private readonly sessionRepository;
    private readonly passwordResetTokenRepository;
    constructor(authConfig: AuthConfig, usersService: UsersService, auditService: AuditService, notificationsService: NotificationsService, settingsService: SettingsService, sessionRepository: Repository<Session>, passwordResetTokenRepository: Repository<PasswordResetToken>);
    login(user: User, ip?: string, userAgent?: string): Promise<AuthResponseDto>;
    logout(rawSessionId: string, userId: string): Promise<{
        message: string;
    }>;
    logoutAll(userId: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    verifyResetCode(email: string, code: string): Promise<{
        resetToken: string;
    }>;
    resetPassword(resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
    private hashToken;
    private buildExpiresAt;
}
//# sourceMappingURL=auth.service.d.ts.map