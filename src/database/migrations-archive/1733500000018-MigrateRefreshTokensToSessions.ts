import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Breaking change: reemplaza el sistema JWT (access_token + refresh_token)
 * por sesiones server-side con UUID opaco.
 *
 * - Crea tabla `sessions` con índice único en `token`
 * - Elimina tabla `refresh_tokens`
 */
export class MigrateRefreshTokensToSessions1733500000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
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
