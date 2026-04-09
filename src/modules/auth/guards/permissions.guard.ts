import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { User } from '../../../database/entities/user.entity';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/enums/error-codes.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin @RequirePermissions() → cualquier usuario autenticado puede acceder
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as User;

    // Usuario del sistema bypasea todo
    if (user?.isSystemUser) return true;

    const userPermissions = (user?.roles ?? []).flatMap((role) =>
      (role.permissions ?? []).map((p) => p.name),
    );

    const hasAll = required.every((p) => userPermissions.includes(p));
    if (!hasAll) {
      throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, 'No tenés los permisos necesarios');
    }

    return true;
  }
}
