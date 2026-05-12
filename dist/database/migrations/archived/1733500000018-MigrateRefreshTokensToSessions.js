"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateRefreshTokensToSessions1733500000018 = void 0;
class MigrateRefreshTokensToSessions1733500000018 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "token"       character varying NOT NULL,
        "userId"      uuid              NOT NULL,
        "expiresAt"   TIMESTAMP         NOT NULL,
        "revokedAt"   TIMESTAMP,
        "userAgent"   character varying,
        "ip"          character varying,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sessions_token" UNIQUE ("token"),
        CONSTRAINT "FK_sessions_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_sessions_userId" ON "sessions" ("userId")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_sessions_expiresAt" ON "sessions" ("expiresAt")
    `);
        await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "sessions"`);
        await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "token"       character varying NOT NULL,
        "userId"      uuid              NOT NULL,
        "expiresAt"   TIMESTAMP         NOT NULL,
        "revokedAt"   TIMESTAMP,
        "userAgent"   character varying,
        "ip"          character varying,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    }
}
exports.MigrateRefreshTokensToSessions1733500000018 = MigrateRefreshTokensToSessions1733500000018;
//# sourceMappingURL=1733500000018-MigrateRefreshTokensToSessions.js.map