"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddPasswordResetTokens1733500000015 = void 0;
class AddPasswordResetTokens1733500000015 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "codeHash" varchar NOT NULL,
        "resetTokenHash" varchar,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "usedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
    }
}
exports.AddPasswordResetTokens1733500000015 = AddPasswordResetTokens1733500000015;
//# sourceMappingURL=1733500000015-AddPasswordResetTokens.js.map