"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserPreferences1733500000014 = void 0;
class AddUserPreferences1733500000014 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_preferences" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "theme" varchar(10) NOT NULL DEFAULT 'system',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_preferences_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_user_preferences" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_preferences_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "user_preferences"`);
    }
}
exports.AddUserPreferences1733500000014 = AddUserPreferences1733500000014;
//# sourceMappingURL=1733500000014-AddUserPreferences.js.map