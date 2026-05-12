"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const core_seeds_1 = require("./core-seeds");
async function runSeed() {
    try {
        await data_source_1.AppDataSource.initialize();
        console.log('✅ Conexión a base de datos establecida\n');
        await (0, core_seeds_1.runCoreSeeds)(data_source_1.AppDataSource);
    }
    catch (error) {
        console.error('❌ Error ejecutando seeds:', error);
        process.exit(1);
    }
    finally {
        await data_source_1.AppDataSource.destroy();
    }
}
runSeed();
//# sourceMappingURL=run-seed.js.map