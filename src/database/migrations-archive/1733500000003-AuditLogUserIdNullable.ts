import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditLogUserIdNullable1733500000003 implements MigrationInterface {
  name = 'AuditLogUserIdNullable1733500000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar FK existente sin importar el nombre que tenga (puede variar según cómo se creó la tabla)
    await queryRunner.query(`
      DO $$ DECLARE r RECORD;
      BEGIN
        FOR r IN SELECT constraint_name FROM information_schema.table_constraints
                 WHERE table_name = 'audit_logs' AND constraint_type = 'FOREIGN KEY'
                 AND constraint_name LIKE '%userId%' OR constraint_name LIKE '%cfa83f61%'
        LOOP
          EXECUTE 'ALTER TABLE audit_logs DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
      END $$;
    `);
    await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "userId" DROP NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "FK_audit_logs_userId"`);
    await queryRunner.query(`ALTER TABLE "audit_logs" ALTER COLUMN "userId" SET NOT NULL`);
    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }
}
