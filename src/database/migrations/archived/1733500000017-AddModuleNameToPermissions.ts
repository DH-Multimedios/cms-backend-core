import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModuleNameToPermissions1733500000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "permissions" ADD COLUMN "moduleName" character varying NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "permissions" DROP COLUMN "moduleName"
    `);
  }
}
