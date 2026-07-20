import { Injectable, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { createHash } from 'crypto';
import { Request } from 'express';
import { Session } from '../../../database/entities/session.entity';
import { User } from '../../../database/entities/user.entity';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/enums/error-codes.enum';

/**
 * Extrae el session ID del request.
 * Prioridad: cookie `session_id` → header `x-session-id`
 *
 * Web:     cookie HttpOnly `session_id`
 * Flutter: header `X-Session-Id`
 */
function extractSessionId(req: Request): string | null {
  return req?.cookies?.session_id ?? req.headers['x-session-id']?.toString() ?? null;
}

@Injectable()
export class SessionStrategy extends PassportStrategy(Strategy, 'session') {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  async validate(req: Request): Promise<User> {
    const rawSessionId = extractSessionId(req);

    if (!rawSessionId) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Sesión no encontrada',
      );
    }

    const tokenHash = createHash('sha256').update(rawSessionId).digest('hex');

    const session = await this.sessionRepository.findOne({
      where: {
        token: tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: { user: { roles: { permissions: true } } },
    });

    if (!session || !session.user?.isActive) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Sesión inválida, expirada o usuario inactivo',
      );
    }

    return session.user;
  }
}
