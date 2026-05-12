import { DataSource } from 'typeorm';
export interface ExtraRole {
    name: string;
    label: string;
    description?: string;
    weight?: number;
    isProtected?: boolean;
}
export interface CoreSeedOptions {
    extraRoles?: ExtraRole[];
}
export declare function runCoreSeeds(dataSource: DataSource, options?: CoreSeedOptions): Promise<void>;
//# sourceMappingURL=core-seeds.d.ts.map