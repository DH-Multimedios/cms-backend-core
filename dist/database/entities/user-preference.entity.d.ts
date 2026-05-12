import { User } from './user.entity';
export type ThemePreference = 'light' | 'dark' | 'system';
export declare class UserPreference {
    id: string;
    userId: string;
    user: User;
    theme: ThemePreference;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user-preference.entity.d.ts.map