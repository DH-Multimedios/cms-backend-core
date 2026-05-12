"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSettingCategories1733500000004 = void 0;
class AddSettingCategories1733500000004 {
    name = 'AddSettingCategories1733500000004';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "setting_categories" (
        "id" SERIAL NOT NULL,
        "key" character varying NOT NULL,
        "label" character varying NOT NULL,
        "description" character varying,
        "order" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_setting_categories_key" UNIQUE ("key"),
        CONSTRAINT "PK_setting_categories_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "settings"
        ADD COLUMN "categoryId" integer,
        ADD COLUMN "label" character varying NOT NULL DEFAULT '',
        ADD COLUMN "order" integer NOT NULL DEFAULT 0
    `);
        await queryRunner.query(`
      ALTER TABLE "settings"
        ADD CONSTRAINT "FK_settings_categoryId"
        FOREIGN KEY ("categoryId")
        REFERENCES "setting_categories"("id")
        ON DELETE SET NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "settings" ALTER COLUMN "label" DROP DEFAULT
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "settings" DROP CONSTRAINT "FK_settings_categoryId"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "label"`);
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "categoryId"`);
        await queryRunner.query(`DROP TABLE "setting_categories"`);
    }
}
exports.AddSettingCategories1733500000004 = AddSettingCategories1733500000004;
//# sourceMappingURL=1733500000004-AddSettingCategories.js.map