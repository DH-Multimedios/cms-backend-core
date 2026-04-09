import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogUserIdNullable1733500000003 implements MigrationInterface {
  name = 'AuditLogUserIdNullable1733500000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_userId"`);
    await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "userId" DROP NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_audit_logs_userId"`);
    await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "userId" SET NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }
}
