import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../database/entities/role.entity';
import { User } from '../../database/entities/user.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesQueryDto } from './dto/roles-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService,
  ) {}

  async findList(currentUser: User) {
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

  async findAll(query: RolesQueryDto): Promise<PaginatedResult<Role>> {
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

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.ROLE_NOT_FOUND,
        `Rol ${id} no encontrado`,
      );
    return role;
  }

  async create(dto: CreateRoleDto, currentUser: User): Promise<Role> {
    const existing = await this.roleRepository.findOneBy({ name: dto.name });
    if (existing)
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.ROLE_NAME_TAKEN,
        'Ya existe un rol con ese nombre',
      );

    if (dto.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.ROLE_PROTECTED,
        'Solo el usuario del sistema puede crear roles protegidos',
      );
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

  async update(id: string, dto: UpdateRoleDto, currentUser: User): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.ROLE_PROTECTED,
        'No podés modificar un rol protegido',
      );
    }

    const auditBefore: Record<string, any> = {};
    const auditAfter: Record<string, any> = {};

    if (dto.name && dto.name !== role.name) {
      const existing = await this.roleRepository.findOneBy({ name: dto.name });
      if (existing)
        throw new ApiException(
          HttpStatus.CONFLICT,
          ErrorCode.ROLE_NAME_TAKEN,
          'Ya existe un rol con ese nombre',
        );
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
      metadata:
        Object.keys(auditAfter).length > 0 ? { before: auditBefore, after: auditAfter } : null,
    });

    return saved;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const role = await this.findOne(id);

    if (role.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.ROLE_PROTECTED,
        'No podés eliminar un rol protegido',
      );
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

  async assignPermissions(id: string, permissionIds: string[], currentUser: User): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.ROLE_PROTECTED,
        'No podés modificar permisos de un rol protegido',
      );
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

  async updatePermissions(
    id: string,
    dto: { add?: string[]; remove?: string[] },
    currentUser: User,
  ): Promise<Role> {
    if ((!dto.add || dto.add.length === 0) && (!dto.remove || dto.remove.length === 0)) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        'Debe enviar al menos add o remove con IDs de permisos',
      );
    }

    const role = await this.findOne(id);
    // Need relations loaded
    const roleWithPerms = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!roleWithPerms) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.ROLE_NOT_FOUND,
        `Rol ${id} no encontrado`,
      );
    }

    if (roleWithPerms.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.ROLE_PROTECTED,
        'No podés modificar permisos de un rol protegido',
      );
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
}
