import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { AuthConfig } from '../../core/interfaces/core-config.interface';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthResponseDto, TokensDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';

@Injectable()
export class AuthService {
  constructor(
    @Inject('CORE_AUTH_CONFIG') private readonly authConfig: AuthConfig,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  async login(user: User, ip?: string, userAgent?: string): Promise<AuthResponseDto> {
    await this.usersService.updateLastLogin(user.id);
    const tokens = await this.generateTokens(user, ip, userAgent);

    await this.auditService.log({
      action: 'login',
      entity: 'User',
      entityId: user.id,
      userId: user.id,
    });

    return { ...tokens, user: UserResponseDto.from(user) };
  }

  async refresh(rawToken: string, ip?: string, userAgent?: string): Promise<TokensDto> {
    const tokenHash = this.hashToken(rawToken);

    const stored = await this.refreshTokenRepository.findOne({
      where: {
        token: tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!stored || !stored.user.isActive) {
      await this.auditService.log({
        action: 'refresh_failed',
        entity: 'User',
        userId: null,
        metadata: { reason: 'invalid_or_expired_token' },
      });
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_REFRESH_TOKEN,
        'Refresh token inválido o expirado',
      );
    }

    // Rotación: revocar el token usado
    stored.revokedAt = new Date();
    await this.refreshTokenRepository.save(stored);

    return this.generateTokens(stored.user, ip, userAgent);
  }

  async logout(rawToken: string, userId: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(rawToken);
    await this.refreshTokenRepository.update(
      { token: tokenHash, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    await this.auditService.log({
      action: 'logout',
      entity: 'User',
      entityId: userId,
      userId,
    });

    return { message: 'Sesión cerrada correctamente' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    await this.auditService.log({
      action: 'logout_all',
      entity: 'User',
      entityId: userId,
      userId,
    });

    return { message: 'Todas las sesiones fueron cerradas' };
  }

  private async generateTokens(user: User, ip?: string, userAgent?: string): Promise<TokensDto> {
    const payload: JwtPayload = {
      sub: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    const rawRefreshToken = randomUUID();
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date();
    const days = this.authConfig.jwtRefreshExpiration
      ? parseInt(this.authConfig.jwtRefreshExpiration)
      : 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        token: tokenHash,
        userId: user.id,
        expiresAt,
        ip,
        userAgent,
      }),
    );

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    // Siempre responder igual para no revelar si el email existe
    if (!user || !user.isActive) {
      return { message: 'Si el email existe, recibirás un código en breve' };
    }

    // Invalidar tokens anteriores del usuario
    await this.passwordResetTokenRepository.update(
      { userId: user.id, usedAt: null },
      { usedAt: new Date() },
    );

    // Generar código 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.passwordResetTokenRepository.save(
      this.passwordResetTokenRepository.create({
        userId: user.id,
        codeHash,
        expiresAt,
      }),
    );

    // Enviar email
    await this.notificationsService.sendEmail({
      to: email,
      subject: 'Código de recuperación de contraseña',
      html: `
        <p>Tu código de recuperación es:</p>
        <h1 style="letter-spacing: 8px; font-size: 36px;">${code}</h1>
        <p>Válido por 15 minutos. Si no solicitaste esto, ignorá este email.</p>
      `,
    });

    return { message: 'Si el email existe, recibirás un código en breve' };
  }

  async verifyResetCode(email: string, code: string): Promise<{ resetToken: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        'Código inválido o expirado',
      );
    }

    const codeHash = createHash('sha256').update(code).digest('hex');
    const token = await this.passwordResetTokenRepository.findOne({
      where: {
        userId: user.id,
        codeHash,
        usedAt: null,
      },
    });

    if (!token || token.expiresAt < new Date()) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        'Código inválido o expirado',
      );
    }

    // Generar resetToken de un solo uso (5 minutos)
    const resetToken = randomUUID();
    const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');
    token.resetTokenHash = resetTokenHash;
    token.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min para completar el reset
    await this.passwordResetTokenRepository.save(token);

    return { resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');

    const token = await this.passwordResetTokenRepository.findOne({
      where: { resetTokenHash, usedAt: null },
      relations: ['user'],
    });

    if (!token || token.expiresAt < new Date()) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        'Token inválido o expirado',
      );
    }

    // Actualizar password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(token.userId, hashedPassword);

    // Marcar token como usado
    token.usedAt = new Date();
    await this.passwordResetTokenRepository.save(token);

    // Revocar todas las sesiones activas del usuario
    await this.refreshTokenRepository.update(
      { userId: token.userId, revokedAt: null },
      { revokedAt: new Date() },
    );

    return { message: 'Contraseña actualizada correctamente' };
  }
}
