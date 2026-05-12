"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsProtectedToSettings1733500000013 = void 0;
class AddIsProtectedToSettings1733500000013 {
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "setting_categories" ADD COLUMN IF NOT EXISTS "isProtected" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "isProtected" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN IF EXISTS "isProtected"`);
        await queryRunner.query(`ALTER TABLE "setting_categories" DROP COLUMN IF EXISTS "isProtected"`);
    }
}
exports.AddIsProtectedToSettings1733500000013 = AddIsProtectedToSettings1733500000013;
//# sourceMappingURL=1733500000013-AddIsProtectedToSettings.js.map