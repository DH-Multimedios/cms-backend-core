"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const entities_1 = require("./entities");
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    static forRoot(config) {
        return {
            module: DatabaseModule_1,
            imports: [
                typeorm_1.TypeOrmModule.forRoot({
                    type: config.type || 'postgres',
                    host: config.host,
                    port: config.port,
                    username: config.username,
                    password: config.password,
                    database: config.database,
                    entities: entities_1.CORE_ENTITIES,
                    autoLoadEntities: true,
                    synchronize: config.synchronize || false,
                    logging: config.logging || false,
                    ssl: config.ssl || false,
                }),
            ],
            exports: [typeorm_1.TypeOrmModule],
        };
    }
    static forRootAsync(options) {
        return {
            module: DatabaseModule_1,
            imports: [
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: options.imports,
                    useFactory: async (...args) => {
                        const config = await options.useFactory(...args);
                        return {
                            type: config.type || 'postgres',
                            host: config.host,
                            port: config.port,
                            username: config.username,
                            password: config.password,
                            database: config.database,
                            entities: entities_1.CORE_ENTITIES,
                            autoLoadEntities: true,
                            synchronize: config.synchronize || false,
                            logging: config.logging || false,
                            ssl: config.ssl || false,
                        };
                    },
                    inject: options.inject || [],
                }),
            ],
            exports: [typeorm_1.TypeOrmModule],
        };
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = DatabaseModule_1 = __decorate([
    (0, common_1.Module)({})
], DatabaseModule);
//# sourceMappingURL=database.module.js.map