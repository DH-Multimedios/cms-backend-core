import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: AuditQueryDto): Promise<import("../..").PaginatedResult<import("./dto/audit-log-response.dto").AuditLogListItemDto>>;
    findOne(id: string): Promise<import("./dto/audit-log-response.dto").AuditLogDetailDto>;
}
//# sourceMappingURL=audit.controller.d.ts.map