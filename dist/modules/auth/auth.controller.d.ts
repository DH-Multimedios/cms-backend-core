import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../../database/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthConfig } from '../../core/interfaces/core-config.interface';
export declare class AuthController {
    private readonly authService;
    private readonly authConfig;
    constructor(authService: AuthService, authConfig: AuthConfig);
    private get cookiePath();
    private get cookieSecure();
    private get cookieSameSite();
    private get sessionMaxAge();
    login(user: User, req: any, _dto: LoginDto, res: Response): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    logout(user: User, req: any, res: Response): Promise<{
        message: string;
    }>;
    logoutAll(user: User, res: Response): Promise<{
        message: string;
    }>;
    me(user: User): UserResponseDto;
    myPermissions(user: User): {
        isSystemUser: boolean;
        maxWeight: number;
        permissions: string[];
    };
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyResetCode(dto: VerifyResetCodeDto): Promise<{
        resetToken: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map