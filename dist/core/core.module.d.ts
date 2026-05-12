import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CoreModuleConfig, CoreModuleAsyncOptions } from './interfaces/core-config.interface';
export declare class CoreModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
    private static getMediaPath;
    static register(config: CoreModuleConfig): DynamicModule;
    static registerAsync(options: CoreModuleAsyncOptions): DynamicModule;
}
//# sourceMappingURL=core.module.d.ts.map