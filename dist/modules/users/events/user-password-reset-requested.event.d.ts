import { User } from '../../../database/entities/user.entity';
export declare class UserPasswordResetRequestedEvent {
    readonly user: User;
    readonly resetToken: string;
    constructor(user: User, resetToken: string);
}
//# sourceMappingURL=user-password-reset-requested.event.d.ts.map