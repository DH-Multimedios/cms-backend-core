"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const entities_1 = require("./entities");
(0, dotenv_1.config)();
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'backend_core_dev',
    entities: entities_1.CORE_ENTITIES,
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
});
//# sourceMappingURL=data-source.js.map