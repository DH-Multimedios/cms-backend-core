"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../../database/entities/role.entity");
const permissions_service_1 = require("../permissions/permissions.service");
const audit_service_1 = require("../audit/audit.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
let RolesService = class RolesService {
    roleRepository;
    permissionsService;
    auditService;
    constructor(roleRepository, permissionsService, auditService) {
        this.roleRepository = roleRepository;
        this.permissionsService = permissionsService;
        this.auditService = auditService;
    }
    async findList(currentUser) {
        const qb = this.roleRepository
            .createQueryBuilder('role')
            .select(['role.id', 'role.name', 'role.label', 'role.weight', 'role.isProtected'])
            .orderBy('role.weight', 'DESC');
        if (!currentUser.isSystemUser) {
            const maxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
            qb.where('role.weight <= :maxWeight', { maxWeight });
        }
        return qb.getMany();
    }
    async findAll(query) {
        const { page = 1, limit = 20, sortOrder = 'DESC', sortBy = 'weight', search } = query;
        const qb = this.roleRepository
            .createQueryBuilder('role')
            .leftJoinAndSelect('role.permissions', 'permission');
        if (search) {
            qb.where('role.name ILIKE :search OR role.label ILIKE :search', { search: `%${search}%` });
        }
        qb.orderBy(`role.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id) {
        const role = await this.roleRepository.findOneBy({ id });
        if (!role)
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.ROLE_NOT_FOUND, `Rol ${id} no encontrado`);
        return role;
    }
    async create(dto, currentUser) {
        const existing = await this.roleRepository.findOneBy({ name: dto.name });
        if (existing)
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.ROLE_NAME_TAKEN, 'Ya existe un rol con ese nombre');
        if (dto.isProtected && !currentUser.isSystemUser) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.ROLE_PROTECTED, 'Solo el usuario del sistema puede crear roles protegidos');
        }
        const role = this.roleRepository.create(dto);
        const saved = await this.roleRepository.save(role);
        await this.auditService.log({
            action: 'create',
            entity: 'Role',
            entityId: saved.id,
            metadata: {
                after: { name: saved.name, label: saved.label, weight: saved.weight, isProtected: saved.isProtected },
            },
        });
        return saved;
    }
    async update(id, dto, currentUser) {
        const role = await this.findOne(id);
        if (role.isProtected && !currentUser.isSystemUser) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.ROLE_PROTECTED, 'No podés modificar un rol protegido');
        }
        const auditBefore = {};
        const auditAfter = {};
        if (dto.name && dto.name !== role.name) {
            const existing = await this.roleRepository.findOneBy({ name: dto.name });
            if (existing)
                throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.ROLE_NAME_TAKEN, 'Ya existe un rol con ese nombre');
            auditBefore.name = role.name;
            auditAfter.name = dto.name;
        }
        if (dto.label !== undefined && dto.label !== role.label) {
            auditBefore.label = role.label;
            auditAfter.label = dto.label;
        }
        if (dto.description !== undefined && dto.description !== role.description) {
            auditBefore.description = role.description;
            auditAfter.description = dto.description;
        }
        if (dto.weight !== undefined && dto.weight !== role.weight) {
            auditBefore.weight = role.weight;
            auditAfter.weight = dto.weight;
        }
        Object.assign(role, dto);
        const saved = await this.roleRepository.save(role);
        await this.auditService.log({
            action: 'update',
            entity: 'Role',
            entityId: saved.id,
            metadata: Object.keys(auditAfter).length > 0 ? { before: auditBefore, after: auditAfter } : null,
        });
        return saved;
    }
    async remove(id, currentUser) {
        const role = await this.findOne(id);
        if (role.isProtected && !currentUser.isSystemUser) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.ROLE_PROTECTED, 'No podés eliminar un rol protegido');
        }
        await this.auditService.log({
            action: 'delete',
            entity: 'Role',
            entityId: id,
            metadata: {
                before: { name: role.name, label: role.label, weight: role.weight },
            },
        });
        await this.roleRepository.remove(role);
    }
    async assignPermissions(id, permissionIds, currentUser) {
        const role = await this.findOne(id);
        if (role.isProtected && !currentUser.isSystemUser) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.ROLE_PROTECTED, 'No podés modificar permisos de un rol protegido');
        }
        const previousPermissionIds = role.permissions?.map((p) => p.id) ?? [];
        const permissions = await this.permissionsService.findByIds(permissionIds);
        role.permissions = permissions;
        const saved = await this.roleRepository.save(role);
        await this.auditService.log({
            action: 'assign_permissions',
            entity: 'Role',
            entityId: id,
            metadata: {
                before: { permissionIds: previousPermissionIds },
                after: { permissionIds },
            },
        });
        return saved;
    }
    async updatePermissions(id, dto, currentUser) {
        if ((!dto.add || dto.add.length === 0) && (!dto.remove || dto.remove.length === 0)) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, 'Debe enviar al menos add o remove con IDs de permisos');
        }
        const role = await this.findOne(id);
        const roleWithPerms = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
        if (!roleWithPerms) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.ROLE_NOT_FOUND, `Rol ${id} no encontrado`);
        }
        if (roleWithPerms.isProtected && !currentUser.isSystemUser) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.ROLE_PROTECTED, 'No podés modificar permisos de un rol protegido');
        }
        const previousPermissionIds = roleWithPerms.permissions.map((p) => p.id);
        const currentIds = new Set(roleWithPerms.permissions.map((p) => p.id));
        if (dto.add?.length) {
            for (const pid of dto.add) {
                currentIds.add(pid);
            }
        }
        if (dto.remove?.length) {
            for (const pid of dto.remove) {
                currentIds.delete(pid);
            }
        }
        const targetIds = [...currentIds];
        const permissions = await this.permissionsService.findByIds(targetIds);
        roleWithPerms.permissions = permissions;
        const saved = await this.roleRepository.save(roleWithPerms);
        await this.auditService.log({
            action: 'update_permissions',
            entity: 'Role',
            entityId: id,
            metadata: {
                before: { permissionIds: previousPermissionIds },
                after: { add: dto.add ?? [], remove: dto.remove ?? [] },
            },
        });
        return saved;
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        permissions_service_1.PermissionsService,
        audit_service_1.AuditService])
], RolesService);
//# sourceMappingURL=roles.service.js.map