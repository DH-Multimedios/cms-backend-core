import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1733500000009 implements MigrationInterface {
  name = 'AddNotifications1733500000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "email_layouts" (
        "id" SERIAL NOT NULL,
        "type" character varying NOT NULL,
        "name" character varying NOT NULL,
        "sections" jsonb NOT NULL,
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_layouts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "email_templates" (
        "id" SERIAL NOT NULL,
        "entityType" character varying NOT NULL,
        "notificationType" character varying NOT NULL,
        "name" character varying NOT NULL,
        "subject" character varying NOT NULL,
        "headerId" integer,
        "footerId" integer,
        "bodySections" jsonb NOT NULL,
        "variables" jsonb NOT NULL DEFAULT '[]',
        "compiledHtml" text,
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_templates_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_email_templates_entity_notification" UNIQUE ("entityType", "notificationType"),
        CONSTRAINT "FK_email_templates_header" FOREIGN KEY ("headerId") REFERENCES "email_layouts"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_email_templates_footer" FOREIGN KEY ("footerId") REFERENCES "email_layouts"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notification_types" (
        "id" SERIAL NOT NULL,
        "key" character varying NOT NULL,
        "entityType" character varying NOT NULL,
        "notificationType" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" character varying,
        "userConfigurable" boolean NOT NULL DEFAULT true,
        "defaultEnabled" boolean NOT NULL DEFAULT true,
        "isEnabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_types_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_types_key" UNIQUE ("key")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_notification_preferences" (
        "id" SERIAL NOT NULL,
        "userId" uuid NOT NULL,
        "notificationTypeKey" character varying NOT NULL,
        "enabled" boolean NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_notification_preferences_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_notif_pref_user_type" UNIQUE ("userId", "notificationTypeKey"),
        CONSTRAINT "FK_user_notif_pref_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_notification_preferences"`);
    await queryRunner.query(`DROP TABLE "notification_types"`);
    await queryRunner.query(`DROP TABLE "email_templates"`);
    await queryRunner.query(`DROP TABLE "email_layouts"`);
  }
}
