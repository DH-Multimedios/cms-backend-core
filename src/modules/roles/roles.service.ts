import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../database/entities/role.entity';
import { User } from '../../database/entities/user.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionsService: PermissionsService,
  ) {}

  findAll(): Promise<Role[]> {
    return this.roleRepository.find({ order: { weight: 'DESC', name: 'ASC' } });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.ROLE_NOT_FOUND, `Rol ${id} no encontrado`);
    return role;
  }

  async create(dto: CreateRoleDto, currentUser: User): Promise<Role> {
    const existing = await this.roleRepository.findOneBy({ name: dto.name });
    if (existing) throw new ApiException(HttpStatus.CONFLICT, ErrorCode.ROLE_NAME_TAKEN, 'Ya existe un rol con ese nombre');

    if (dto.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ROLE_PROTECTED, 'Solo el usuario del sistema puede crear roles protegidos');
    }

    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async update(id: string, dto: UpdateRoleDto, currentUser: User): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ROLE_PROTECTED, 'No podés modificar un rol protegido');
    }

    if (dto.name && dto.name !== role.name) {
      const existing = await this.roleRepository.findOneBy({ name: dto.name });
      if (existing) throw new ApiException(HttpStatus.CONFLICT, ErrorCode.ROLE_NAME_TAKEN, 'Ya existe un rol con ese nombre');
    }

    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const role = await this.findOne(id);

    if (role.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ROLE_PROTECTED, 'No podés eliminar un rol protegido');
    }

    await this.roleRepository.remove(role);
  }

  async assignPermissions(id: string, permissionIds: string[], currentUser: User): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ROLE_PROTECTED, 'No podés modificar permisos de un rol protegido');
    }

    const permissions = await this.permissionsService.findByIds(permissionIds);
    role.permissions = permissions;
    return this.roleRepository.save(role);
  }
}
