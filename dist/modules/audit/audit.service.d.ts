import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuditLogListItemDto, AuditLogDetailDto } from './dto/audit-log-response.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
export interface AuditLogOptions {
    action: string;
    entity: string;
    entityId?: string;
    metadata?: Record<string, any> | null;
    userId?: string | null;
}
export declare class AuditService {
    private readonly auditLogRepository;
    private readonly cls;
    constructor(auditLogRepository: Repository<AuditLog>, cls: ClsService);
    log(options: AuditLogOptions): Promise<void>;
    findAll(query: AuditQueryDto): Promise<PaginatedResult<AuditLogListItemDto>>;
    findOne(id: string): Promise<AuditLogDetailDto>;
}
//# sourceMappingURL=audit.service.d.ts.map