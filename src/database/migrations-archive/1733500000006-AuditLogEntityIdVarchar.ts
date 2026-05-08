import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogEntityIdVarchar1733500000006 implements MigrationInterface {
  name = 'AuditLogEntityIdVarchar1733500000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
        ALTER COLUMN "entityId" TYPE character varying
        USING "entityId"::text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
        ALTER COLUMN "entityId" TYPE uuid
        USING "entityId"::uuid
    `);
  }
}
