import { User } from './user.entity';
import { Permission } from './permission.entity';
export declare class Role {
    id: string;
    name: string;
    label: string;
    description: string;
    weight: number;
    isProtected: boolean;
    users: User[];
    permissions: Permission[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=role.entity.d.ts.map