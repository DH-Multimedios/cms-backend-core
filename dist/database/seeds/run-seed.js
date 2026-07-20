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
        process.exitCode = 1;
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
        }
    }
}
void runSeed();
//# sourceMappingURL=run-seed.js.map