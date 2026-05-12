"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineSchema1733500000100 = void 0;
class BaselineSchema1733500000100 {
    name = 'BaselineSchema1733500000100';
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "email"        character varying NOT NULL,
        "password"     character varying NOT NULL,
        "firstName"    character varying,
        "lastName"     character varying,
        "username"     character varying,
        "avatarUrl"    character varying,
        "isActive"     boolean           NOT NULL DEFAULT true,
        "isSystemUser" boolean           NOT NULL DEFAULT false,
        "isProtected"  boolean           NOT NULL DEFAULT false,
        "lastLoginAt"  TIMESTAMP,
        "createdAt"    TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email"    UNIQUE ("email"),
        CONSTRAINT "PK_users_id"       PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_users_email"        ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_isSystemUser" ON "users" ("isSystemUser")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_users_username" ON "users" ("username") WHERE "username" IS NOT NULL`);
        await queryRunner.query(`
      CREATE TABLE "roles" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"        character varying NOT NULL,
        "label"       character varying NOT NULL,
        "description" character varying,
        "weight"      integer           NOT NULL DEFAULT 0,
        "isProtected" boolean           NOT NULL DEFAULT false,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles_id"   PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_roles_name" ON "roles" ("name")`);
        await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"        character varying NOT NULL,
        "description" character varying,
        "module"      character varying NOT NULL,
        "moduleName"  character varying,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
        CONSTRAINT "PK_permissions_id"   PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_permissions_module" ON "permissions" ("module")`);
        await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "userId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId"),
        CONSTRAINT "FK_user_roles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id")   ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id")   ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "roleId"       uuid NOT NULL,
        "permissionId" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("roleId", "permissionId"),
        CONSTRAINT "FK_role_permissions_roleId"       FOREIGN KEY ("roleId")       REFERENCES "roles"("id")       ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permissionId" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "token"     character varying NOT NULL,
        "userId"    uuid              NOT NULL,
        "expiresAt" TIMESTAMP         NOT NULL,
        "revokedAt" TIMESTAMP,
        "userAgent" character varying,
        "ip"        character varying,
        "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sessions"    PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sessions_token" UNIQUE ("token"),
        CONSTRAINT "FK_sessions_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_userId"    ON "sessions" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_sessions_expiresAt" ON "sessions" ("expiresAt")`);
        await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "userId"    uuid,
        "action"    character varying NOT NULL,
        "entity"    character varying NOT NULL,
        "entityId"  character varying,
        "metadata"  jsonb,
        "ip"        character varying,
        "userAgent" character varying,
        "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_logs_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_userId"    ON "audit_logs" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity"    ON "audit_logs" ("entity")`);
        await queryRunner.query(`CREATE INDEX "IDX_audit_logs_createdAt" ON "audit_logs" ("createdAt")`);
        await queryRunner.query(`
      CREATE TABLE "taxonomies" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "name"        character varying NOT NULL,
        "slug"        character varying NOT NULL,
        "type"        character varying NOT NULL,
        "description" text,
        "imageId"     uuid,
        "parentId"    uuid,
        "order"       integer           NOT NULL DEFAULT 0,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_taxonomies_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_taxonomies_id"   PRIMARY KEY ("id"),
        CONSTRAINT "FK_taxonomies_parentId" FOREIGN KEY ("parentId") REFERENCES "taxonomies"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_taxonomies_type"     ON "taxonomies" ("type")`);
        await queryRunner.query(`CREATE INDEX "IDX_taxonomies_slug"     ON "taxonomies" ("slug")`);
        await queryRunner.query(`CREATE INDEX "IDX_taxonomies_parentId" ON "taxonomies" ("parentId")`);
        await queryRunner.query(`
      CREATE TABLE "entity_taxonomies" (
        "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "entityType" character varying NOT NULL,
        "entityId"   uuid              NOT NULL,
        "taxonomyId" uuid              NOT NULL,
        "createdAt"  TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_entity_taxonomies_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_entity_taxonomies"    UNIQUE ("entityType", "entityId", "taxonomyId"),
        CONSTRAINT "FK_entity_taxonomies_taxonomyId" FOREIGN KEY ("taxonomyId") REFERENCES "taxonomies"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_entity_taxonomies_entity" ON "entity_taxonomies" ("entityType", "entityId")`);
        await queryRunner.query(`
      CREATE TABLE "files" (
        "id"                uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "filename"          character varying NOT NULL,
        "originalName"      character varying NOT NULL,
        "mimetype"          character varying NOT NULL,
        "size"              bigint            NOT NULL,
        "path"              character varying NOT NULL,
        "name"              character varying NOT NULL DEFAULT '',
        "description"       text,
        "usage"             character varying NOT NULL DEFAULT 'documents',
        "isPublic"          boolean           NOT NULL DEFAULT false,
        "downloadCount"     integer           NOT NULL DEFAULT 0,
        "uploadedByUserId"  uuid              NOT NULL,
        "fileOwnerUserId"   uuid,
        "createdAt"         TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"         TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_files_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_files_uploadedByUserId"  FOREIGN KEY ("uploadedByUserId")  REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_files_fileOwnerUserId"   FOREIGN KEY ("fileOwnerUserId")   REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "media" (
        "id"               uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "filename"         character varying NOT NULL,
        "originalName"     character varying NOT NULL,
        "mimetype"         character varying NOT NULL,
        "size"             bigint            NOT NULL,
        "path"             character varying NOT NULL,
        "url"              character varying NOT NULL DEFAULT '',
        "alt"              character varying NOT NULL DEFAULT '',
        "width"            integer           NOT NULL DEFAULT 0,
        "height"           integer           NOT NULL DEFAULT 0,
        "usage"            character varying NOT NULL DEFAULT 'images',
        "uploadedByUserId" uuid              NOT NULL,
        "createdAt"        TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_media_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_media_uploadedByUserId" FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "setting_categories" (
        "id"          SERIAL            NOT NULL,
        "slug"        character varying NOT NULL,
        "label"       character varying NOT NULL,
        "description" character varying,
        "order"       integer           NOT NULL DEFAULT 0,
        "isProtected" boolean           NOT NULL DEFAULT false,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_setting_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_setting_categories_id"   PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "settings" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "key"         character varying NOT NULL,
        "value"       text              NOT NULL,
        "label"       character varying NOT NULL,
        "description" character varying,
        "type"        character varying NOT NULL DEFAULT 'string',
        "inputType"   character varying NOT NULL DEFAULT 'text',
        "meta"        jsonb,
        "order"       integer           NOT NULL DEFAULT 0,
        "isProtected" boolean           NOT NULL DEFAULT false,
        "categoryId"  integer,
        "createdAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_settings_key" UNIQUE ("key"),
        CONSTRAINT "PK_settings_id"  PRIMARY KEY ("id"),
        CONSTRAINT "FK_settings_categoryId" FOREIGN KEY ("categoryId") REFERENCES "setting_categories"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "email_providers" (
        "id"        SERIAL            NOT NULL,
        "name"      character varying NOT NULL,
        "provider"  character varying NOT NULL,
        "from"      character varying,
        "config"    jsonb             NOT NULL,
        "isActive"  boolean           NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_providers_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "email_layouts" (
        "id"        SERIAL            NOT NULL,
        "type"      character varying NOT NULL,
        "name"      character varying NOT NULL,
        "sections"  jsonb             NOT NULL,
        "isDefault" boolean           NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_layouts_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "email_templates" (
        "id"               SERIAL            NOT NULL,
        "entityType"       character varying NOT NULL,
        "notificationType" character varying NOT NULL,
        "name"             character varying NOT NULL,
        "subject"          character varying NOT NULL,
        "headerId"         integer,
        "footerId"         integer,
        "bodySections"     jsonb             NOT NULL,
        "variables"        jsonb             NOT NULL DEFAULT '[]',
        "compiledHtml"     text,
        "isDefault"        boolean           NOT NULL DEFAULT false,
        "createdAt"        TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_templates_id"                    PRIMARY KEY ("id"),
        CONSTRAINT "UQ_email_templates_entity_notification"   UNIQUE ("entityType", "notificationType"),
        CONSTRAINT "FK_email_templates_header" FOREIGN KEY ("headerId") REFERENCES "email_layouts"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_email_templates_footer" FOREIGN KEY ("footerId") REFERENCES "email_layouts"("id") ON DELETE SET NULL
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "notification_types" (
        "id"               SERIAL            NOT NULL,
        "key"              character varying NOT NULL,
        "entityType"       character varying NOT NULL,
        "notificationType" character varying NOT NULL,
        "name"             character varying NOT NULL,
        "description"      character varying,
        "userConfigurable" boolean           NOT NULL DEFAULT true,
        "defaultEnabled"   boolean           NOT NULL DEFAULT true,
        "isEnabled"        boolean           NOT NULL DEFAULT true,
        "createdAt"        TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_types_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_types_key" UNIQUE ("key")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "user_notification_preferences" (
        "id"                  SERIAL            NOT NULL,
        "userId"              uuid              NOT NULL,
        "notificationTypeKey" character varying NOT NULL,
        "enabled"             boolean           NOT NULL,
        "createdAt"           TIMESTAMP         NOT NULL DEFAULT now(),
        "updatedAt"           TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_notification_preferences_id"  PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_notif_pref_user_type"         UNIQUE ("userId", "notificationTypeKey"),
        CONSTRAINT "FK_user_notif_pref_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "user_preferences" (
        "id"        uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "userId"    uuid      NOT NULL,
        "theme"     varchar(10) NOT NULL DEFAULT 'system',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_preferences_userId" UNIQUE ("userId"),
        CONSTRAINT "PK_user_preferences"        PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_preferences_user"   FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id"             uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "userId"         uuid        NOT NULL,
        "codeHash"       varchar     NOT NULL,
        "resetTokenHash" varchar,
        "expiresAt"      TIMESTAMPTZ NOT NULL,
        "usedAt"         TIMESTAMPTZ,
        "createdAt"      TIMESTAMP   NOT NULL DEFAULT now(),
        CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_password_reset_tokens_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_preferences"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_notification_preferences"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification_types"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "email_templates"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "email_layouts"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "email_providers"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "settings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "setting_categories"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "media"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "files"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "entity_taxonomies"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "taxonomies"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sessions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}
exports.BaselineSchema1733500000100 = BaselineSchema1733500000100;
//# sourceMappingURL=1733500000100-BaselineSchema.js.map