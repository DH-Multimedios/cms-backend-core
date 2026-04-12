import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsProtectedToSettings1733500000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "setting_categories" ADD COLUMN IF NOT EXISTS "isProtected" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "isProtected" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN IF EXISTS "isProtected"`);
    await queryRunner.query(`ALTER TABLE "setting_categories" DROP COLUMN IF EXISTS "isProtected"`);
  }
}
