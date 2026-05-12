import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
declare const SessionAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class SessionAuthGuard extends SessionAuthGuard_base {
    private readonly reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
//# sourceMappingURL=session-auth.guard.d.ts.map