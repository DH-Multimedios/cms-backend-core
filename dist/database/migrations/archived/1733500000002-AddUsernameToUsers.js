"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUsernameToUsers1733500000002 = void 0;
class AddUsernameToUsers1733500000002 {
    name = 'AddUsernameToUsers1733500000002';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_username" ON "users" ("username") WHERE "username" IS NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_users_username"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }
}
exports.AddUsernameToUsers1733500000002 = AddUsernameToUsers1733500000002;
//# sourceMappingURL=1733500000002-AddUsernameToUsers.js.map