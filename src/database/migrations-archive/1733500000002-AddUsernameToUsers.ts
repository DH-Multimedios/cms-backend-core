import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUsers1733500000002 implements MigrationInterface {
  name = 'AddUsernameToUsers1733500000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_username" ON "users" ("username") WHERE "username" IS NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_username"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
  }
}
