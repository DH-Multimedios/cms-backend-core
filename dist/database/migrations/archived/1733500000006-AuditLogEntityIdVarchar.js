"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogEntityIdVarchar1733500000006 = void 0;
class AuditLogEntityIdVarchar1733500000006 {
    name = 'AuditLogEntityIdVarchar1733500000006';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "audit_logs"
        ALTER COLUMN "entityId" TYPE character varying
        USING "entityId"::text
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "audit_logs"
        ALTER COLUMN "entityId" TYPE uuid
        USING "entityId"::uuid
    `);
    }
}
exports.AuditLogEntityIdVarchar1733500000006 = AuditLogEntityIdVarchar1733500000006;
//# sourceMappingURL=1733500000006-AuditLogEntityIdVarchar.js.map