import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

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
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return UserResponseDto.from(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing) throw new ConflictException('El email ya está en uso');

    const roles = dto.roleIds?.length
      ? await this.roleRepository.findByIds(dto.roleIds)
      : [];

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
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
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    if (user.isProtected && !currentUser.isSystemUser) {
      throw new ForbiddenException('No podés modificar un usuario protegido');
    }

    if (dto.roleIds !== undefined) {
      const currentMaxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
      const newRoles = await this.roleRepository.findByIds(dto.roleIds);

      if (!currentUser.isSystemUser) {
        const hasHigherRole = newRoles.some((r) => r.weight > currentMaxWeight);
        if (hasHigherRole) {
          throw new ForbiddenException('No podés asignar un rol de mayor peso al tuyo');
        }
      }

      user.roles = newRoles;
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
    if (!user) throw new NotFoundException(`Usuario ${id} no encontrado`);

    if (user.isProtected && !currentUser.isSystemUser) {
      throw new ForbiddenException('No podés eliminar un usuario protegido');
    }

    await this.userRepository.remove(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }
}
