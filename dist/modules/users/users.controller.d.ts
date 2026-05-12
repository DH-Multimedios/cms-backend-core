import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { User } from '../../database/entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(query: UsersQueryDto, currentUser: User): Promise<import("../..").PaginatedResult<import("./dto/user-response.dto").UserResponseDto>>;
    findList(search: string, currentUser: User): Promise<{
        id: string;
        label: string;
    }[]>;
    findByUsername(username: string, currentUser: User): Promise<import("./dto/user-response.dto").UserResponseDto>;
    findOne(id: string, currentUser: User): Promise<import("./dto/user-response.dto").UserResponseDto>;
    create(dto: CreateUserDto): Promise<import("./dto/user-response.dto").UserResponseDto>;
    updateMe(currentUser: User, dto: UpdateProfileDto): Promise<import("./dto/user-response.dto").UserResponseDto>;
    uploadMyAvatar(file: Express.Multer.File, currentUser: User, alt?: string): Promise<import("./dto/user-response.dto").UserResponseDto>;
    uploadUserAvatar(id: string, file: Express.Multer.File, alt?: string): Promise<import("./dto/user-response.dto").UserResponseDto>;
    removeMyAvatar(currentUser: User): Promise<import("./dto/user-response.dto").UserResponseDto>;
    removeUserAvatar(id: string): Promise<import("./dto/user-response.dto").UserResponseDto>;
    update(id: string, dto: UpdateUserDto, currentUser: User): Promise<import("./dto/user-response.dto").UserResponseDto>;
    remove(id: string, currentUser: User): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map