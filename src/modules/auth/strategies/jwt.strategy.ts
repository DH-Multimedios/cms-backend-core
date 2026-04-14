import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { AuthConfig } from '../../../core/interfaces/core-config.interface';
import { User } from '../../../database/entities/user.entity';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/enums/error-codes.enum';

export interface JwtPayload {
  sub: string;
  /** Peso máximo entre todos los roles del usuario — solo para routing del proxy, el backend no autoriza por peso */
  maxWeight: number;
  /** Indica si es el usuario del sistema — bypass total en el proxy */
  isSystemUser: boolean;
}

// Extrae token de cookie 'access_token' o de header Authorization: Bearer
function extractFromCookieOrBearer(req: Request): string | null {
  if (req?.cookies?.access_token) {
    return req.cookies.access_token;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject('CORE_AUTH_CONFIG') authConfig: AuthConfig,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: extractFromCookieOrBearer,
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });

    if (!user || !user.isActive) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Token inválido o usuario inactivo',
      );
    }

    return user;
  }
}
