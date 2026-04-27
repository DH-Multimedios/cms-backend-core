import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettingInputTypeMeta1733500000008 implements MigrationInterface {
  name = 'AddSettingInputTypeMeta1733500000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "settings"
        ADD COLUMN "inputType" character varying NOT NULL DEFAULT 'text',
        ADD COLUMN "meta" jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "settings"
        DROP COLUMN "meta",
        DROP COLUMN "inputType"
    `);
  }
}
