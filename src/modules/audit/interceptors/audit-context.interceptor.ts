import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';

/**
 * Populates the CLS context with ip, userAgent, and userId
 * for every incoming HTTP request.
 * Must run AFTER JwtAuthGuard has attached req.user.
 */
@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request & { user?: { id: string } }>();

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket?.remoteAddress ??
      null;

    const userAgent = req.headers['user-agent'] ?? null;
    const userId = req.user?.id ?? null;

    this.cls.set('ip', ip);
    this.cls.set('userAgent', userAgent);
    this.cls.set('userId', userId);

    return next.handle();
  }
}
