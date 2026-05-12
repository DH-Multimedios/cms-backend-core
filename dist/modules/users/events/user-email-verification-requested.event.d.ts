import { User } from '../../../database/entities/user.entity';
export declare class UserEmailVerificationRequestedEvent {
    readonly user: User;
    readonly verificationToken: string;
    constructor(user: User, verificationToken: string);
}
//# sourceMappingURL=user-email-verification-requested.event.d.ts.map