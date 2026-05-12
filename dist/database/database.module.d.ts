import { DynamicModule } from '@nestjs/common';
import { DatabaseConfig } from '../core/interfaces/core-config.interface';
export declare class DatabaseModule {
    static forRoot(config: DatabaseConfig): DynamicModule;
    static forRootAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => Promise<DatabaseConfig> | DatabaseConfig;
        inject?: any[];
    }): DynamicModule;
}
//# sourceMappingURL=database.module.d.ts.map