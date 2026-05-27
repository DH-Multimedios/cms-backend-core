import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega soft delete con timestamp a la tabla users.
 *
 * - `deletedAt` registra cuándo fue dado de baja formalmente el usuario
 * - Habilita el soporte nativo de TypeORM: softDelete(), restore(), withDeleted()
 * - Complementa a `isActive`: ambos campos coexisten con semántica diferente
 *   · isActive: false, deletedAt: null  → inactivo temporalmente
 *   · deletedAt: timestamp              → dado de baja formalmente
 */
export class AddDeletedAtToUsers1733500000102 implements MigrationInterface {
  name = 'AddDeletedAtToUsers1733500000102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP NULL DEFAULT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_deletedAt"
        ON "users" ("deletedAt")
        WHERE "deletedAt" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_deletedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "deletedAt"`);
  }
}
