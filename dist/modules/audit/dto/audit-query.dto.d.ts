import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class AuditQueryDto extends PaginationDto {
    userId?: string;
    entity?: string;
    action?: string;
    from?: string;
    to?: string;
    sortBy?: 'createdAt';
}
//# sourceMappingURL=audit-query.dto.d.ts.map