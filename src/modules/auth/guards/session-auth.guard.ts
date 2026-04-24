import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable()
export class SessionAuthGuard extends AuthGuard('session') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Intentar extraer usuario de la sesión si existe, pero no fallar si no hay sesión
      try {
        const result = super.canActivate(context);
        if (result instanceof Observable) {
          return await lastValueFrom(result);
        }
        return await Promise.resolve(result);
      } catch {
        return true;
      }
    }

    const result = super.canActivate(context);
    if (result instanceof Observable) {
      return await lastValueFrom(result);
    }
    return await Promise.resolve(result);
  }
}
