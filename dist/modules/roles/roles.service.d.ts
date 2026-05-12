import { Repository } from 'typeorm';
import { Role } from '../../database/entities/role.entity';
import { User } from '../../database/entities/user.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesQueryDto } from './dto/roles-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
export declare class RolesService {
    private readonly roleRepository;
    private readonly permissionsService;
    private readonly auditService;
    constructor(roleRepository: Repository<Role>, permissionsService: PermissionsService, auditService: AuditService);
    findList(currentUser: User): Promise<Role[]>;
    findAll(query: RolesQueryDto): Promise<PaginatedResult<Role>>;
    findOne(id: string): Promise<Role>;
    create(dto: CreateRoleDto, currentUser: User): Promise<Role>;
    update(id: string, dto: UpdateRoleDto, currentUser: User): Promise<Role>;
    remove(id: string, currentUser: User): Promise<void>;
    assignPermissions(id: string, permissionIds: string[], currentUser: User): Promise<Role>;
    updatePermissions(id: string, dto: {
        add?: string[];
        remove?: string[];
    }, currentUser: User): Promise<Role>;
}
//# sourceMappingURL=roles.service.d.ts.map