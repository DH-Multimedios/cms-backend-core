import { Repository } from 'typeorm';
export declare abstract class BaseUserPreferencesService<T extends {
    userId: string;
}> {
    protected readonly repository: Repository<T>;
    constructor(repository: Repository<T>);
    findOrCreate(userId: string, defaults?: Partial<Omit<T, 'userId'>>): Promise<T>;
    update(userId: string, dto: Partial<Omit<T, 'userId'>>): Promise<T>;
}
//# sourceMappingURL=base-user-preferences.service.d.ts.map