"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddEmailProviders1733500000005 = void 0;
class AddEmailProviders1733500000005 {
    name = 'AddEmailProviders1733500000005';
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "email_providers"`);
    }
}
exports.AddEmailProviders1733500000005 = AddEmailProviders1733500000005;
//# sourceMappingURL=1733500000005-AddEmailProviders.js.map