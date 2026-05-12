import { User } from '../../../database/entities/user.entity';
export declare class UserResponseDto {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isSystemUser: boolean;
    isProtected: boolean;
    avatarUrl: string | null;
    roles: {
        id: string;
        name: string;
        label: string;
        weight: number;
    }[];
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    static from(user: User): UserResponseDto;
}
//# sourceMappingURL=user-response.dto.d.ts.map