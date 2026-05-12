import { PermissionsService } from './permissions.service';
import { PermissionsQueryDto } from './dto/permissions-query.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findList(): Promise<import("../..").Permission[]>;
    findAll(query: PermissionsQueryDto): Promise<import("../..").PaginatedResult<import("../..").Permission>>;
}
//# sourceMappingURL=permissions.controller.d.ts.map