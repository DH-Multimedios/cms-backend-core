import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailProviders1733500000005 implements MigrationInterface {
  name = 'AddEmailProviders1733500000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "email_providers" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "provider" character varying NOT NULL,
        "from" character varying,
        "config" jsonb NOT NULL,
        "isActive" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_providers_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "email_providers"`);
  }
}
