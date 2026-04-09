import { User } from '../../../database/entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isProtected: boolean;
  roles: { id: string; name: string; weight: number }[];
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;

  static from(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.isActive = user.isActive;
    dto.isProtected = user.isProtected;
    dto.roles = (user.roles || []).map((r) => ({ id: r.id, name: r.name, weight: r.weight }));
    dto.lastLoginAt = user.lastLoginAt;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
