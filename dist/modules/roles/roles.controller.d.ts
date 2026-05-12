import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { RolesQueryDto } from './dto/roles-query.dto';
import { User } from '../../database/entities/user.entity';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    findAll(query: RolesQueryDto): Promise<import("../..").PaginatedResult<import("../..").Role>>;
    findList(currentUser: User): Promise<import("../..").Role[]>;
    findOne(id: string): Promise<import("../..").Role>;
    create(dto: CreateRoleDto, currentUser: User): Promise<import("../..").Role>;
    update(id: string, dto: UpdateRoleDto, currentUser: User): Promise<import("../..").Role>;
    remove(id: string, currentUser: User): Promise<void>;
    updatePermissions(id: string, dto: UpdatePermissionsDto, currentUser: User): Promise<import("../..").Role>;
    assignPermissions(id: string, dto: AssignPermissionsDto, currentUser: User): Promise<import("../..").Role>;
}
//# sourceMappingURL=roles.controller.d.ts.map