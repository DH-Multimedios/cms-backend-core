"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddModuleNameToPermissions1733500000017 = void 0;
class AddModuleNameToPermissions1733500000017 {
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "permissions" ADD COLUMN "moduleName" character varying NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "permissions" DROP COLUMN "moduleName"
    `);
    }
}
exports.AddModuleNameToPermissions1733500000017 = AddModuleNameToPermissions1733500000017;
//# sourceMappingURL=1733500000017-AddModuleNameToPermissions.js.map