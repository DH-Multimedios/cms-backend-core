import { DynamicModule } from '@nestjs/common';
import { AuthConfig } from '../../core/interfaces/core-config.interface';
export declare class AuthModule {
    static register(authConfig: AuthConfig): DynamicModule;
    static registerAsync(options: {
        imports?: any[];
        useFactory: (...args: any[]) => Promise<AuthConfig> | AuthConfig;
        inject?: any[];
    }): DynamicModule;
}
//# sourceMappingURL=auth.module.d.ts.map