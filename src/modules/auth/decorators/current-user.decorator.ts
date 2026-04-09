import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../database/entities/user.entity';

/**
 * Extrae el usuario actual del request
 * @example login(@CurrentUser() user: User)
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
