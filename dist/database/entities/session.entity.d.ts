import { User } from './user.entity';
export declare class Session {
    id: string;
    token: string;
    userId: string;
    user: User;
    expiresAt: Date;
    revokedAt: Date;
    userAgent: string;
    ip: string;
    createdAt: Date;
}
//# sourceMappingURL=session.entity.d.ts.map