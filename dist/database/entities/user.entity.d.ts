import { Role } from './role.entity';
export declare class User {
    id: string;
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isSystemUser: boolean;
    isProtected: boolean;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
    avatarUrl: string | null;
    lastLoginAt: Date;
}
//# sourceMappingURL=user.entity.d.ts.map