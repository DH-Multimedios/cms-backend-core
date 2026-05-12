import { Repository } from 'typeorm';
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
export declare class UsersService {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly auditService;
    private readonly mediaService;
    private readonly eventEmitter;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, auditService: AuditService, mediaService: MediaService, eventEmitter: EventEmitter2);
    findAll(query: UsersQueryDto, currentUser: User): Promise<PaginatedResult<UserResponseDto>>;
    findOne(id: string, currentUser: User): Promise<UserResponseDto>;
    findByUsername(username: string, currentUser: User): Promise<UserResponseDto>;
    findList(search: string, currentUser: User): Promise<{
        id: string;
        label: string;
    }[]>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailOrUsername(login: string): Promise<User | null>;
    create(dto: CreateUserDto): Promise<UserResponseDto>;
    update(id: string, dto: UpdateUserDto, currentUser: User): Promise<UserResponseDto>;
    remove(id: string, currentUser: User): Promise<{
        message: string;
    }>;
    updateProfile(currentUser: User, dto: UpdateProfileDto): Promise<UserResponseDto>;
    uploadAvatar(userId: string, file: Express.Multer.File, alt?: string): Promise<UserResponseDto>;
    removeAvatar(userId: string): Promise<UserResponseDto>;
    updateLastLogin(id: string): Promise<void>;
    updatePassword(id: string, hashedPassword: string): Promise<void>;
}
//# sourceMappingURL=users.service.d.ts.map