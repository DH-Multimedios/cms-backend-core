"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddAvatarUrlToUsers1733500000016 = void 0;
class AddAvatarUrlToUsers1733500000016 {
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "avatarUrl" character varying NULL
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "avatarUrl"
    `);
    }
}
exports.AddAvatarUrlToUsers1733500000016 = AddAvatarUrlToUsers1733500000016;
//# sourceMappingURL=1733500000016-AddAvatarUrlToUsers.js.map