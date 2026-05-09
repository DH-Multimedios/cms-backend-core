import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega campo `label` a roles y cambia los names de los roles core a snake_case.
 *
 * - `name` pasa a ser clave técnica interna en snake_case (ej: super_admin, admin, user)
 * - `label` es el texto visible para la UI (ej: "Super Admin", "Admin", "Usuario")
 *
 * Debe ser compatible con dos escenarios:
 * - DB vieja sin `label` y con roles core en PascalCase
 * - DB nueva creada desde el baseline, donde `label` ya existe
 */
export class AddRoleLabelAndSnakeCaseName1733500000101 implements MigrationInterface {
  name = 'AddRoleLabelAndSnakeCaseName1733500000101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar columna label solo si todavía no existe
    await queryRunner.query(`
      ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "label" character varying
    `);

    // 2. Poblar label con el nombre actual antes de cambiar a snake_case
    await queryRunner.query(`UPDATE "roles" SET "label" = "name"`);

    // 3. Cambiar names de roles core a snake_case
    await queryRunner.query(`UPDATE "roles" SET "name" = 'super_admin', "label" = 'Super Admin' WHERE "name" = 'SuperAdmin'`);
    await queryRunner.query(`UPDATE "roles" SET "name" = 'admin',       "label" = 'Admin'       WHERE "name" = 'Admin'`);
    await queryRunner.query(`UPDATE "roles" SET "name" = 'user',        "label" = 'Usuario'     WHERE "name" = 'User'`);

    // 4. Hacer label NOT NULL
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "label" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir snake_case a PascalCase para los roles core
    await queryRunner.query(`UPDATE "roles" SET "name" = 'SuperAdmin' WHERE "name" = 'super_admin'`);
    await queryRunner.query(`UPDATE "roles" SET "name" = 'Admin'      WHERE "name" = 'admin'`);
    await queryRunner.query(`UPDATE "roles" SET "name" = 'User'       WHERE "name" = 'user'`);

    // Eliminar columna label si existe
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN IF EXISTS "label"`);
  }
}
