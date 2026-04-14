import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAvatarUrlToUsers1733500000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "avatarUrl" character varying NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "avatarUrl"
    `);
  }
}
