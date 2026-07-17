import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../../database/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthConfig } from '../../core/interfaces/core-config.interface';

@ApiTags('Auth')
@UseGuards(SessionAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('CORE_AUTH_CONFIG') private readonly authConfig: AuthConfig,
  ) {}

  private get cookiePath() {
    return this.authConfig.cookiePath ?? '/';
  }

  private get cookieDomain() {
    return this.authConfig.cookieDomain;
  }

  private get cookieSecure() {
    if (this.cookieSameSite === 'none') return true;
    return this.authConfig.cookieSecure ?? process.env.NODE_ENV === 'production';
  }

  private get cookieSameSite(): 'strict' | 'lax' | 'none' {
    return (
      this.authConfig.cookieSameSite ?? (process.env.NODE_ENV === 'production' ? 'lax' : 'none')
    );
  }

  private get sessionMaxAge() {
    const days = this.authConfig.sessionExpiration
      ? parseInt(this.authConfig.sessionExpiration)
      : 365;
    return days * 24 * 60 * 60 * 1000;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login con email/username y password' })
  async login(
    @CurrentUser() user: User,
    @Req() req: any,
    @Body() _dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(user, req.ip, req.headers['user-agent']);

    // Web: cookie HttpOnly — el frontend no necesita leer el sessionId
    res.cookie('session_id', result.sessionId, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      maxAge: this.sessionMaxAge,
      path: this.cookiePath,
      domain: this.cookieDomain,
    });

    // Devolver el body completo para compatibilidad con Flutter
    // (Flutter lee el sessionId del body y lo guarda en SecureStorage)
    return result;
  }

  @Post('logout')
  @ApiSecurity('session')
  @ApiOperation({ summary: 'Cerrar sesión actual' })
  async logout(
    @CurrentUser() user: User,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const rawSessionId = req.cookies?.session_id ?? req.headers['x-session-id'];

    res.clearCookie('session_id', {
      path: this.cookiePath,
      domain: this.cookieDomain,
    });

    return this.authService.logout(rawSessionId, user.id);
  }

  @Post('logout-all')
  @ApiSecurity('session')
  @ApiOperation({ summary: 'Cerrar todas las sesiones del usuario' })
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    res.clearCookie('session_id', {
      path: this.cookiePath,
      domain: this.cookieDomain,
    });
    return this.authService.logoutAll(user.id);
  }

  @Get('me')
  @ApiSecurity('session')
  @ApiOperation({ summary: 'Obtener usuario actual' })
  me(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.from(user);
  }

  @Get('me/permissions')
  @ApiSecurity('session')
  @ApiOperation({ summary: 'Obtener permisos del usuario actual' })
  myPermissions(@CurrentUser() user: User) {
    const permissionSet = new Set<string>();
    let maxWeight = 0;
    for (const role of user.roles || []) {
      if (role.weight > maxWeight) maxWeight = role.weight;
      for (const perm of role.permissions || []) {
        permissionSet.add(perm.name);
      }
    }
    if (user.isSystemUser) maxWeight = 100;

    return {
      isSystemUser: user.isSystemUser,
      maxWeight,
      permissions: Array.from(permissionSet),
    };
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar código de recuperación de contraseña' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('verify-reset-code')
  @ApiOperation({ summary: 'Verificar código y obtener token de reset' })
  verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(dto.email, dto.code);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Establecer nueva contraseña con el token de reset' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.resetToken, dto.newPassword);
  }
}
