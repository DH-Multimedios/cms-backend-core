import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { AuditService } from '../audit/audit.service';
import { MediaService } from '../media/media.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { UserCreatedEvent } from './events/user-created.event';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly auditService: AuditService,
    private readonly mediaService: MediaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(query: UsersQueryDto, currentUser: User): Promise<PaginatedResult<UserResponseDto>> {
    const {
      page = 1,
      limit = 20,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
      search,
      isActive,
      roleId,
    } = query;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .where('user.isSystemUser = false');

    if (!currentUser.isSystemUser) {
      const maxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
      qb.andWhere(
        `user.id NOT IN (
          SELECT ur."userId" FROM user_roles ur
          INNER JOIN roles r ON r.id = ur."roleId"
          WHERE r.weight > :maxWeight
        )`,
        { maxWeight },
      );
    }

    if (search) {
      qb.andWhere(
        '(user.email ILIKE :search OR user.username ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    if (roleId) {
      qb.andWhere(
        `user.id IN (SELECT ur."userId" FROM user_roles ur WHERE ur."roleId" = :roleId)`,
        { roleId },
      );
    }

    qb.orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      items: users.map(UserResponseDto.from),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser: User): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id, isSystemUser: false },
      relations: ['roles'],
    });
    if (!user)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
        `Usuario ${id} no encontrado`,
      );

    if (!currentUser.isSystemUser) {
      const currentMaxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
      const targetMaxWeight = Math.max(...(user.roles?.map((r) => r.weight) ?? [0]));
      if (targetMaxWeight > currentMaxWeight)
        throw new ApiException(
          HttpStatus.FORBIDDEN,
          ErrorCode.ROLE_WEIGHT_EXCEEDED,
          'No tenés permiso para ver este usuario',
        );
    }

    return UserResponseDto.from(user);
  }

  async findByUsername(username: string, currentUser: User): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { username, isSystemUser: false },
      relations: ['roles'],
    });
    if (!user)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
        `Usuario ${username} no encontrado`,
      );

    if (!currentUser.isSystemUser) {
      const currentMaxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
      const targetMaxWeight = Math.max(...(user.roles?.map((r) => r.weight) ?? [0]));
      if (targetMaxWeight > currentMaxWeight)
        throw new ApiException(
          HttpStatus.FORBIDDEN,
          ErrorCode.ROLE_WEIGHT_EXCEEDED,
          'No tenés permiso para ver este usuario',
        );
    }

    return UserResponseDto.from(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByEmailOrUsername(login: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: login }, { username: login }],
    });
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing)
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.USER_EMAIL_TAKEN,
        'El email ya está en uso',
      );

    if (dto.username) {
      const existingUsername = await this.userRepository.findOneBy({ username: dto.username });
      if (existingUsername)
        throw new ApiException(
          HttpStatus.CONFLICT,
          ErrorCode.USERNAME_TAKEN,
          'El username ya está en uso',
        );
    }

    const roles = dto.roleIds?.length
      ? await this.roleRepository.findByIds(dto.roleIds)
      : await this.roleRepository.find({ order: { weight: 'ASC' }, take: 1 });

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles,
    });

    const saved = await this.userRepository.save(user);

    await this.auditService.log({
      action: 'create',
      entity: 'User',
      entityId: saved.id,
      metadata: {
        after: {
          email: saved.email,
          username: saved.username ?? null,
          firstName: saved.firstName,
          lastName: saved.lastName,
          roles: roles.map((r) => r.id),
        },
      },
    });

    this.eventEmitter.emit('user.created', new UserCreatedEvent(saved));

    return UserResponseDto.from(saved);
  }

  async update(id: string, dto: UpdateUserDto, currentUser: User): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id, isSystemUser: false } });
    if (!user)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
        `Usuario ${id} no encontrado`,
      );

    if (user.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.USER_PROTECTED,
        'No podés modificar un usuario protegido',
      );
    }

    const auditBefore: Record<string, any> = {};
    const auditAfter: Record<string, any> = {};

    if (dto.roleIds !== undefined) {
      if (!currentUser.isSystemUser) {
        const hasRolesUpdatePermission = currentUser.roles?.some((r) =>
          r.permissions?.some((p) => p.name === 'roles.update'),
        );
        if (!hasRolesUpdatePermission) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            ErrorCode.FORBIDDEN,
            'No tenés permiso para modificar roles de usuarios',
          );
        }
      }

      const currentMaxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
      const newRoles = await this.roleRepository.findByIds(dto.roleIds);

      if (!currentUser.isSystemUser) {
        const hasHigherRole = newRoles.some((r) => r.weight > currentMaxWeight);
        if (hasHigherRole) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            ErrorCode.ROLE_WEIGHT_EXCEEDED,
            'No podés asignar un rol de mayor peso al tuyo',
          );
        }
      }

      auditBefore.roles = user.roles?.map((r) => r.id) ?? [];
      auditAfter.roles = dto.roleIds;
      user.roles = newRoles;
    }

    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.userRepository.findOneBy({ email: dto.email });
      if (existing)
        throw new ApiException(
          HttpStatus.CONFLICT,
          ErrorCode.USER_EMAIL_TAKEN,
          'El email ya está en uso',
        );
      auditBefore.email = user.email;
      auditAfter.email = dto.email;
      user.email = dto.email;
    }

    if (dto.username !== undefined && dto.username !== user.username) {
      const existing = await this.userRepository.findOneBy({ username: dto.username });
      if (existing)
        throw new ApiException(
          HttpStatus.CONFLICT,
          ErrorCode.USERNAME_TAKEN,
          'El username ya está en uso',
        );
      auditBefore.username = user.username;
      auditAfter.username = dto.username;
      user.username = dto.username;
    }

    if (dto.password) {
      auditBefore.password = '[hidden]';
      auditAfter.password = '[changed]';
      user.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.firstName !== undefined && dto.firstName !== user.firstName) {
      auditBefore.firstName = user.firstName;
      auditAfter.firstName = dto.firstName;
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined && dto.lastName !== user.lastName) {
      auditBefore.lastName = user.lastName;
      auditAfter.lastName = dto.lastName;
      user.lastName = dto.lastName;
    }
    if (dto.isActive !== undefined && dto.isActive !== user.isActive) {
      auditBefore.isActive = user.isActive;
      auditAfter.isActive = dto.isActive;
      user.isActive = dto.isActive;
    }

    const saved = await this.userRepository.save(user);

    await this.auditService.log({
      action: 'update',
      entity: 'User',
      entityId: saved.id,
      metadata:
        Object.keys(auditAfter).length > 0 ? { before: auditBefore, after: auditAfter } : null,
    });

    return UserResponseDto.from(saved);
  }

  async remove(id: string, currentUser: User): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id, isSystemUser: false } });
    if (!user)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
        `Usuario ${id} no encontrado`,
      );

    if (user.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.USER_PROTECTED,
        'No podés eliminar un usuario protegido',
      );
    }

    await this.auditService.log({
      action: 'delete',
      entity: 'User',
      entityId: id,
      metadata: {
        before: {
          email: user.email,
          username: user.username ?? null,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    });

    await this.userRepository.remove(user);
    return { message: 'Usuario eliminado correctamente' };
  }

  async updateProfile(currentUser: User, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: currentUser.id } });
    if (!user)
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
        'Usuario no encontrado',
      );

    const auditBefore: Record<string, any> = {};
    const auditAfter: Record<string, any> = {};

    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.userRepository.findOneBy({ email: dto.email });
      if (existing)
        throw new ApiException(
          HttpStatus.CONFLICT,
          ErrorCode.USER_EMAIL_TAKEN,
          'El email ya está en uso',
        );
      auditBefore.email = user.email;
      auditAfter.email = dto.email;
      user.email = dto.email;
    }

    if (dto.password) {
      auditBefore.password = '[hidden]';
      auditAfter.password = '[changed]';
      user.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.firstName !== undefined && dto.firstName !== user.firstName) {
      auditBefore.firstName = user.firstName;
      auditAfter.firstName = dto.firstName;
      user.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined && dto.lastName !== user.lastName) {
      auditBefore.lastName = user.lastName;
      auditAfter.lastName = dto.lastName;
      user.lastName = dto.lastName;
    }

    const saved = await this.userRepository.save(user);

    await this.auditService.log({
      action: 'update_profile',
      entity: 'User',
      entityId: saved.id,
      metadata:
        Object.keys(auditAfter).length > 0 ? { before: auditBefore, after: auditAfter } : null,
    });

    return UserResponseDto.from(saved);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
    alt?: string,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
        `Usuario ${userId} no encontrado`,
      );
    }

    // Subir nueva imagen
    const avatar = await this.mediaService.upload(file, userId, {
      alt: alt || `Avatar de ${user.firstName || user.email}`,
      usage: 'avatars',
    });

    // Borrar avatar anterior si existe
    if (user.avatarUrl) {
      const oldPath = user.avatarUrl.replace('/uploads/media/', '');
      const oldMedia = await this.userRepository.manager
        .createQueryBuilder()
        .select('m')
        .from('media', 'm')
        .where('m.path = :path', { path: oldPath })
        .getOne();

      if (oldMedia) {
        await this.mediaService.remove(oldMedia.id, userId, true);
      }
    }

    // Actualizar URL en el usuario
    user.avatarUrl = avatar.url;
    const saved = await this.userRepository.save(user);

    await this.auditService.log({
      action: 'update_avatar',
      entity: 'User',
      entityId: saved.id,
      userId,
      metadata: { avatarUrl: avatar.url },
    });

    return UserResponseDto.from(saved);
  }

  async removeAvatar(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.USER_NOT_FOUND,
        `Usuario ${userId} no encontrado`,
      );
    }

    if (user.avatarUrl) {
      const oldPath = user.avatarUrl.replace('/uploads/media/', '');
      const oldMedia = await this.userRepository.manager
        .createQueryBuilder()
        .select('m')
        .from('media', 'm')
        .where('m.path = :path', { path: oldPath })
        .getOne();

      if (oldMedia) {
        await this.mediaService.remove(oldMedia.id, userId, true);
      }

      user.avatarUrl = null;
      await this.userRepository.save(user);

      await this.auditService.log({
        action: 'remove_avatar',
        entity: 'User',
        entityId: user.id,
        userId,
        metadata: { removedAvatarUrl: oldPath },
      });
    }

    return UserResponseDto.from(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(id, { password: hashedPassword });
  }
}
