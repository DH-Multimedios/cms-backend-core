"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDeletedAtToUsers1733500000102 = void 0;
class AddDeletedAtToUsers1733500000102 {
    name = 'AddDeletedAtToUsers1733500000102';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP NULL DEFAULT NULL
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_deletedAt"
        ON "users" ("deletedAt")
        WHERE "deletedAt" IS NOT NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_deletedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "deletedAt"`);
    }
}
exports.AddDeletedAtToUsers1733500000102 = AddDeletedAtToUsers1733500000102;
//# sourceMappingURL=1733500000102-AddDeletedAtToUsers.js.map