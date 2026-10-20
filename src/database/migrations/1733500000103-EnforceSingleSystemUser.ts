import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Reserva una sola identidad root, incluso si está inactiva o dada de baja.
 * PostgreSQL rechaza el índice si ya hay duplicados; no se modifica ninguna cuenta.
 */
export class EnforceSingleSystemUser1733500000103 implements MigrationInterface {
  name = 'EnforceSingleSystemUser1733500000103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_users_single_system_user"
        ON "users" ("isSystemUser")
        WHERE "isSystemUser" = true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_single_system_user"`);
  }
}
