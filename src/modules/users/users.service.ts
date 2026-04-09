import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      where: { isSystemUser: false },
      order: { createdAt: 'DESC' },
    });
    return users.map(UserResponseDto.from);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id, isSystemUser: false },
    });
    if (!user) throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, `Usuario ${id} no encontrado`);
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
    if (existing) throw new ApiException(HttpStatus.CONFLICT, ErrorCode.USER_EMAIL_TAKEN, 'El email ya está en uso');

    if (dto.username) {
      const existingUsername = await this.userRepository.findOneBy({ username: dto.username });
      if (existingUsername) throw new ApiException(HttpStatus.CONFLICT, ErrorCode.USERNAME_TAKEN, 'El username ya está en uso');
    }

    const roles = dto.roleIds?.length
      ? await this.roleRepository.findByIds(dto.roleIds)
      : [];

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
    return UserResponseDto.from(saved);
  }

  async update(id: string, dto: UpdateUserDto, currentUser: User): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id, isSystemUser: false } });
    if (!user) throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, `Usuario ${id} no encontrado`);

    if (user.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.USER_PROTECTED, 'No podés modificar un usuario protegido');
    }

    if (dto.roleIds !== undefined) {
      const currentMaxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
      const newRoles = await this.roleRepository.findByIds(dto.roleIds);

      if (!currentUser.isSystemUser) {
        const hasHigherRole = newRoles.some((r) => r.weight > currentMaxWeight);
        if (hasHigherRole) {
          throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.ROLE_WEIGHT_EXCEEDED, 'No podés asignar un rol de mayor peso al tuyo');
        }
      }

      user.roles = newRoles;
    }

    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.userRepository.findOneBy({ email: dto.email });
      if (existing) throw new ApiException(HttpStatus.CONFLICT, ErrorCode.USER_EMAIL_TAKEN, 'El email ya está en uso');
      user.email = dto.email;
    }

    if (dto.username !== undefined && dto.username !== user.username) {
      const existing = await this.userRepository.findOneBy({ username: dto.username });
      if (existing) throw new ApiException(HttpStatus.CONFLICT, ErrorCode.USERNAME_TAKEN, 'El username ya está en uso');
      user.username = dto.username;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    const saved = await this.userRepository.save(user);
    return UserResponseDto.from(saved);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id, isSystemUser: false } });
    if (!user) throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, `Usuario ${id} no encontrado`);

    if (user.isProtected && !currentUser.isSystemUser) {
      throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.USER_PROTECTED, 'No podés eliminar un usuario protegido');
    }

    await this.userRepository.remove(user);
  }

  async updateProfile(currentUser: User, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: currentUser.id } });
    if (!user) throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, 'Usuario no encontrado');

    if (dto.email !== undefined && dto.email !== user.email) {
      const existing = await this.userRepository.findOneBy({ email: dto.email });
      if (existing) throw new ApiException(HttpStatus.CONFLICT, ErrorCode.USER_EMAIL_TAKEN, 'El email ya está en uso');
      user.email = dto.email;
    }

    if (dto.password) user.password = await bcrypt.hash(dto.password, 10);
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    const saved = await this.userRepository.save(user);
    return UserResponseDto.from(saved);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }
}
