import { AuditLog } from '../../../database/entities/audit-log.entity';
export declare class AuditUserDto {
    id: string;
    firstName: string;
    lastName: string;
    static from(user: AuditLog['user']): AuditUserDto | null;
}
export declare class AuditLogListItemDto {
    id: string;
    userId: string | null;
    user: AuditUserDto | null;
    action: string;
    entity: string;
    entityId: string | null;
    ip: string | null;
    userAgent: string | null;
    createdAt: Date;
    static from(log: AuditLog): AuditLogListItemDto;
}
export declare class AuditLogDetailDto extends AuditLogListItemDto {
    metadata: Record<string, any> | null;
    static from(log: AuditLog): AuditLogDetailDto;
}
//# sourceMappingURL=audit-log-response.dto.d.ts.map