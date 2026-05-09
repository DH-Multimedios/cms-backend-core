import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class DebugRequestInterceptor implements NestInterceptor {
  private readonly logger = new Logger('DebugRequest');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();

    this.logger.debug(
      `${req.method} ${req.path} | query: ${JSON.stringify(req.query)} | body: ${JSON.stringify(req.body)}`,
    );

    return next.handle();
  }
}
