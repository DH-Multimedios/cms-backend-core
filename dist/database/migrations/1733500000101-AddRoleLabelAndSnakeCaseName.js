"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRoleLabelAndSnakeCaseName1733500000101 = void 0;
class AddRoleLabelAndSnakeCaseName1733500000101 {
    name = 'AddRoleLabelAndSnakeCaseName1733500000101';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "roles" ADD COLUMN IF NOT EXISTS "label" character varying
    `);
        await queryRunner.query(`UPDATE "roles" SET "label" = "name"`);
        await queryRunner.query(`UPDATE "roles" SET "name" = 'super_admin', "label" = 'Super Admin' WHERE "name" = 'SuperAdmin'`);
        await queryRunner.query(`UPDATE "roles" SET "name" = 'admin',       "label" = 'Admin'       WHERE "name" = 'Admin'`);
        await queryRunner.query(`UPDATE "roles" SET "name" = 'user',        "label" = 'Usuario'     WHERE "name" = 'User'`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "label" SET NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`UPDATE "roles" SET "name" = 'SuperAdmin' WHERE "name" = 'super_admin'`);
        await queryRunner.query(`UPDATE "roles" SET "name" = 'Admin'      WHERE "name" = 'admin'`);
        await queryRunner.query(`UPDATE "roles" SET "name" = 'User'       WHERE "name" = 'user'`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN IF EXISTS "label"`);
    }
}
exports.AddRoleLabelAndSnakeCaseName1733500000101 = AddRoleLabelAndSnakeCaseName1733500000101;
//# sourceMappingURL=1733500000101-AddRoleLabelAndSnakeCaseName.js.map