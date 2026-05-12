"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSettingInputTypeMeta1733500000008 = void 0;
class AddSettingInputTypeMeta1733500000008 {
    name = 'AddSettingInputTypeMeta1733500000008';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "settings"
        ADD COLUMN "inputType" character varying NOT NULL DEFAULT 'text',
        ADD COLUMN "meta" jsonb
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "settings"
        DROP COLUMN "meta",
        DROP COLUMN "inputType"
    `);
    }
}
exports.AddSettingInputTypeMeta1733500000008 = AddSettingInputTypeMeta1733500000008;
//# sourceMappingURL=1733500000008-AddSettingInputTypeMeta.js.map