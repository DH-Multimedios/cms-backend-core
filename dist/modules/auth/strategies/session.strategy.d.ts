import { Strategy } from 'passport-custom';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Session } from '../../../database/entities/session.entity';
import { User } from '../../../database/entities/user.entity';
declare const SessionStrategy_base: new () => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class SessionStrategy extends SessionStrategy_base {
    private readonly sessionRepository;
    private readonly userRepository;
    constructor(sessionRepository: Repository<Session>, userRepository: Repository<User>);
    validate(req: Request): Promise<User>;
}
export {};
//# sourceMappingURL=session.strategy.d.ts.map