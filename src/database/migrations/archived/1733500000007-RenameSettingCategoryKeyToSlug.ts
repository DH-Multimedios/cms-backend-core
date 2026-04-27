import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSettingCategoryKeyToSlug1733500000007 implements MigrationInterface {
  name = 'RenameSettingCategoryKeyToSlug1733500000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "setting_categories"
        RENAME COLUMN "key" TO "slug"
    `);

    await queryRunner.query(`
      ALTER INDEX IF EXISTS "UQ_setting_categories_key"
        RENAME TO "UQ_setting_categories_slug"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
