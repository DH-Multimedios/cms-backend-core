import { User } from './user.entity';
export declare class AuditLog {
    id: string;
    userId: string | null;
    user: User | null;
    action: string;
    entity: string;
    entityId: string | null;
    metadata: Record<string, any> | null;
    ip: string | null;
    userAgent: string | null;
    createdAt: Date;
}
//# sourceMappingURL=audit-log.entity.d.ts.map