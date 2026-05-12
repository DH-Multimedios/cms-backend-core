import { User } from './user.entity';
export declare class PasswordResetToken {
    id: string;
    userId: string;
    user: User;
    codeHash: string;
    resetTokenHash: string | null;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
}
//# sourceMappingURL=password-reset-token.entity.d.ts.map