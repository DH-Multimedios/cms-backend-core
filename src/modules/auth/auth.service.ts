import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { Session } from '../../database/entities/session.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { AuthConfig } from '../../core/interfaces/core-config.interface';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';

@Injectable()
export class AuthService {
  constructor(
    @Inject('CORE_AUTH_CONFIG') private readonly authConfig: AuthConfig,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  /**
   * Crea una nueva sesión y devuelve el sessionId en texto plano.
   * El sessionId se almacena hasheado en DB; el plano viaja en cookie/header.
   */
  async login(
    user: User,
    ip?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    await this.usersService.updateLastLogin(user.id);

    const rawSessionId = randomUUID();
    const tokenHash = this.hashToken(rawSessionId);
    const expiresAt = this.buildExpiresAt();

    await this.sessionRepository.save(
      this.sessionRepository.create({
        token: tokenHash,
        userId: user.id,
        expiresAt,
        ip,
        userAgent,
      }),
    );

    await this.auditService.log({
      action: 'login',
      entity: 'User',
      entityId: user.id,
      userId: user.id,
    });

    return { sessionId: rawSessionId, user: UserResponseDto.from(user) };
  }

  /**
   * Revoca la sesión asociada al sessionId provisto.
   */
  async logout(rawSessionId: string, userId: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(rawSessionId);
    await this.sessionRepository.update(
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

  /**
   * Revoca todas las sesiones activas del usuario.
   */
  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.sessionRepository.update(
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

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    // Siempre responder igual para no revelar si el email existe
    if (!user || !user.isActive) {
      return { message: 'Si el email existe, recibirás un código en breve' };
    }

    // Invalidar tokens anteriores del usuario
    await this.passwordResetTokenRepository.update(
      { userId: user.id, usedAt: IsNull() },
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

    await this.notificationsService.notifySystem('user.forgot-password-code', email, { code });

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
        usedAt: IsNull(),
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
    token.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.passwordResetTokenRepository.save(token);

    return { resetToken };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    const resetTokenHash = createHash('sha256').update(resetToken).digest('hex');

    const token = await this.passwordResetTokenRepository.findOne({
      where: { resetTokenHash, usedAt: IsNull() },
      relations: ['user'],
    });

    if (!token || token.expiresAt < new Date()) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        'Token inválido o expirado',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(token.userId, hashedPassword);

    token.usedAt = new Date();
    await this.passwordResetTokenRepository.save(token);

    // Revocar todas las sesiones activas del usuario por seguridad
    await this.sessionRepository.update(
      { userId: token.userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    return { message: 'Contraseña actualizada correctamente' };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildExpiresAt(): Date {
    const expiresAt = new Date();
    const days = this.authConfig.sessionExpiration
      ? parseInt(this.authConfig.sessionExpiration)
      : 365;
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }
}
