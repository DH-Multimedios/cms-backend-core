import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../../database/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthConfig } from '../../core/interfaces/core-config.interface';

@ApiTags('Auth')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('CORE_AUTH_CONFIG') private readonly authConfig: AuthConfig,
  ) {}

  private get cookiePath() {
    // El path debe incluir el API prefix del proyecto consumidor
    // Si el backend usa /api como prefix, debe ser /api/auth/refresh
    return this.authConfig.cookiePath ?? '/auth/refresh';
  }

  private get cookieSecure() {
    // SameSite=None REQUIERE Secure=true — Chrome rechaza la cookie si no
    // localhost es tratado como contexto seguro, así que Secure funciona sin HTTPS
    if (this.cookieSameSite === 'none') return true;
    return this.authConfig.cookieSecure ?? process.env.NODE_ENV === 'production';
  }

  private get cookieSameSite(): 'strict' | 'lax' | 'none' {
    // En dev (cross-origin: localhost:3000 → localhost:5010) necesitamos 'none'
    // En prod (mismo origin o behind proxy) usamos 'lax'
    return (
      this.authConfig.cookieSameSite ?? (process.env.NODE_ENV === 'production' ? 'lax' : 'none')
    );
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login con email y password' })
  async login(
    @CurrentUser() user: User,
    @Req() req: any,
    @Body() _dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(user, req.ip, req.headers['user-agent']);

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      maxAge: 15 * 60 * 1000, // 15 minutos
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: this.cookiePath,
    });

    return result; // igual devuelve el body para compatibilidad con Bearer
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Obtener nuevo access token usando refresh token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Leer de cookie si no viene en el body
    const refreshToken = dto.refreshToken ?? req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new HttpException('Refresh token requerido', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.authService.refresh(refreshToken, req.ip, req.headers['user-agent']);

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: this.cookieSecure,
      sameSite: this.cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: this.cookiePath,
    });

    return result;
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión (revoca el refresh token)' })
  async logout(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() user: User,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const refreshToken = dto.refreshToken ?? req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new HttpException('Refresh token requerido', HttpStatus.UNAUTHORIZED);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: this.cookiePath });

    return this.authService.logout(refreshToken, user.id);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar todas las sesiones del usuario' })
  async logoutAll(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: this.cookiePath });
    return this.authService.logoutAll(user.id);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario actual' })
  me(@CurrentUser() user: User): UserResponseDto {
    return UserResponseDto.from(user);
  }

  @Get('me/permissions')
  @ApiBearerAuth()
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
