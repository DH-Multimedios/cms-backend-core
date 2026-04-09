import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import { User } from '../../database/entities/user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { AuthConfig } from '../../core/interfaces/core-config.interface';
import { UsersService } from '../users/users.service';
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
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async login(user: User, ip?: string, userAgent?: string): Promise<AuthResponseDto> {
    await this.usersService.updateLastLogin(user.id);
    const tokens = await this.generateTokens(user, ip, userAgent);
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
      throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_REFRESH_TOKEN, 'Refresh token inválido o expirado');
    }

    // Rotación: revocar el token usado
    stored.revokedAt = new Date();
    await this.refreshTokenRepository.save(stored);

    return this.generateTokens(stored.user, ip, userAgent);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.refreshTokenRepository.update(
      { token: tokenHash, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
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
}
