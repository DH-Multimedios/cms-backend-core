import { Repository } from 'typeorm';
import { Permission } from '../../database/entities/permission.entity';
import { PermissionsQueryDto } from './dto/permissions-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
export interface PermissionDefinition {
    name: string;
    description?: string;
    module: string;
    moduleName?: string;
}
export declare class PermissionsService {
    private readonly permissionRepository;
    constructor(permissionRepository: Repository<Permission>);
    findList(): Promise<Permission[]>;
    findAll(query: PermissionsQueryDto): Promise<PaginatedResult<Permission>>;
    findOne(id: string): Promise<Permission | null>;
    findByIds(ids: string[]): Promise<Permission[]>;
    registerPermissions(permissions: PermissionDefinition[]): Promise<void>;
}
//# sourceMappingURL=permissions.service.d.ts.map