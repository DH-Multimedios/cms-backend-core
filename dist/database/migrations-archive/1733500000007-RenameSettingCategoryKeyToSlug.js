"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenameSettingCategoryKeyToSlug1733500000007 = void 0;
class RenameSettingCategoryKeyToSlug1733500000007 {
    name = 'RenameSettingCategoryKeyToSlug1733500000007';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "setting_categories"
        RENAME COLUMN "key" TO "slug"
    `);
        await queryRunner.query(`
      ALTER INDEX IF EXISTS "UQ_setting_categories_key"
        RENAME TO "UQ_setting_categories_slug"
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER INDEX IF EXISTS "UQ_setting_categories_slug"
        RENAME TO "UQ_setting_categories_key"
    `);
        await queryRunner.query(`
      ALTER TABLE "setting_categories"
        RENAME COLUMN "slug" TO "key"
    `);
    }
}
exports.RenameSettingCategoryKeyToSlug1733500000007 = RenameSettingCategoryKeyToSlug1733500000007;
//# sourceMappingURL=1733500000007-RenameSettingCategoryKeyToSlug.js.map