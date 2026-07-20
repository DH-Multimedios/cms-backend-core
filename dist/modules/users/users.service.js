"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const event_emitter_1 = require("@nestjs/event-emitter");
const user_entity_1 = require("../../database/entities/user.entity");
const role_entity_1 = require("../../database/entities/role.entity");
const audit_service_1 = require("../audit/audit.service");
const media_service_1 = require("../media/media.service");
const user_response_dto_1 = require("./dto/user-response.dto");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const user_created_event_1 = require("./events/user-created.event");
let UsersService = class UsersService {
    userRepository;
    roleRepository;
    auditService;
    mediaService;
    eventEmitter;
    constructor(userRepository, roleRepository, auditService, mediaService, eventEmitter) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.auditService = auditService;
        this.mediaService = mediaService;
        this.eventEmitter = eventEmitter;
    }
    async findAll(query, currentUser) {
        const { page = 1, limit = 20, sortOrder = 'DESC', sortBy = 'createdAt', search, isActive, roleId, } = query;
        const qb = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.roles', 'role')
            .leftJoinAndSelect('role.permissions', 'permission')
            .where('user.isSystemUser = false');
        if (!currentUser.isSystemUser) {
            const maxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
            qb.andWhere(`user.id NOT IN (
          SELECT ur."userId" FROM user_roles ur
          INNER JOIN roles r ON r.id = ur."roleId"
          WHERE r.weight > :maxWeight
        )`, { maxWeight });
        }
        if (search) {
            qb.andWhere('(user.email ILIKE :search OR user.username ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)', { search: `%${search}%` });
        }
        if (isActive !== undefined) {
            qb.andWhere('user.isActive = :isActive', { isActive });
        }
        if (roleId) {
            qb.andWhere(`user.id IN (SELECT ur."userId" FROM user_roles ur WHERE ur."roleId" = :roleId)`, { roleId });
        }
        qb.orderBy(`user.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit);
        const [users, total] = await qb.getManyAndCount();
        return {
            items: users.map(user_response_dto_1.UserResponseDto.from),
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        };
    }
    async findOne(id, currentUser) {
        const user = await this.userRepository.findOne({
            where: { id, isSystemUser: false },
            relations: { roles: true },
        });
        if (!user)
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.USER_NOT_FOUND, `Usuario ${id} no encontrado`);
        if (!currentUser.isSystemUser) {
            const currentMaxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
            const targetMaxWeight = Math.max(...(user.roles?.map((r) => r.weight) ?? [0]));
            if (targetMaxWeight > currentMaxWeight)
                throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.ROLE_WEIGHT_EXCEEDED, 'No tenés permiso para ver este usuario');
        }
        return user_response_dto_1.UserResponseDto.from(user);
    }
    async findByUsername(username, currentUser) {
        const user = await this.userRepository.findOne({
            where: { username, isSystemUser: false },
            relations: { roles: true },
        });
        if (!user)
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.USER_NOT_FOUND, `Usuario ${username} no encontrado`);
        if (!currentUser.isSystemUser) {
            const currentMaxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
            const targetMaxWeight = Math.max(...(user.roles?.map((r) => r.weight) ?? [0]));
            if (targetMaxWeight > currentMaxWeight)
                throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.ROLE_WEIGHT_EXCEEDED, 'No tenés permiso para ver este usuario');
        }
        return user_response_dto_1.UserResponseDto.from(user);
    }
    async findList(search, currentUser) {
        if (!search?.trim())
            return [];
        const qb = this.userRepository
            .createQueryBuilder('user')
            .select(['user.id', 'user.firstName', 'user.lastName'])
            .where('user.isSystemUser = false')
            .andWhere('user.isActive = true')
            .andWhere("(user.firstName ILIKE :search OR user.lastName ILIKE :search OR CONCAT(user.firstName, ' ', user.lastName) ILIKE :search)", { search: `%${search.trim()}%` })
            .orderBy('user.firstName', 'ASC')
            .take(10);
        if (!currentUser.isSystemUser) {
            const maxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
            qb.andWhere(`user.id NOT IN (
          SELECT ur."userId" FROM user_roles ur
          INNER JOIN roles r ON r.id = ur."roleId"
          WHERE r.weight > :maxWeight
        )`, { maxWeight });
        }
        const users = await qb.getMany();
        return users.map((u) => ({ id: u.id, label: `${u.firstName} ${u.lastName}`.trim() }));
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async findByEmailOrUsername(login) {
        return this.userRepository.findOne({
            where: [{ email: login }, { username: login }],
        });
    }
    async create(dto) {
        const existing = await this.userRepository.findOneBy({ email: dto.email });
        if (existing)
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.USER_EMAIL_TAKEN, 'El email ya está en uso');
        if (dto.username) {
            const existingUsername = await this.userRepository.findOneBy({ username: dto.username });
            if (existingUsername)
                throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.USERNAME_TAKEN, 'El username ya está en uso');
        }
        const roles = dto.roleIds?.length
            ? await this.roleRepository.findBy({ id: (0, typeorm_2.In)(dto.roleIds) })
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
        this.eventEmitter.emit('user.created', new user_created_event_1.UserCreatedEvent(saved));
        return user_response_dto_1.UserResponseDto.from(saved);
    }
    async update(id, dto, currentUser) {
        const user = await this.userRepository.findOne({ where: { id, isSystemUser: false } });
        if (!user)
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.USER_NOT_FOUND, `Usuario ${id} no encontrado`);
        if (user.isProtected && !currentUser.isSystemUser) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.USER_PROTECTED, 'No podés modificar un usuario protegido');
        }
        const auditBefore = {};
        const auditAfter = {};
        if (dto.roleIds !== undefined) {
            if (!currentUser.isSystemUser) {
                const hasRolesUpdatePermission = currentUser.roles?.some((r) => r.permissions?.some((p) => p.name === 'roles.update'));
                if (!hasRolesUpdatePermission) {
                    throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.FORBIDDEN, 'No tenés permiso para modificar roles de usuarios');
                }
            }
            const currentMaxWeight = Math.max(...(currentUser.roles?.map((r) => r.weight) ?? [0]));
            const newRoles = dto.roleIds.length
                ? await this.roleRepository.findBy({ id: (0, typeorm_2.In)(dto.roleIds) })
                : [];
            if (!currentUser.isSystemUser) {
                const hasHigherRole = newRoles.some((r) => r.weight > currentMaxWeight);
                if (hasHigherRole) {
                    throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.ROLE_WEIGHT_EXCEEDED, 'No podés asignar un rol de mayor peso al tuyo');
                }
            }
            auditBefore.roles = user.roles?.map((r) => r.id) ?? [];
            auditAfter.roles = dto.roleIds;
            user.roles = newRoles;
        }
        if (dto.email !== undefined && dto.email !== user.email) {
            const existing = await this.userRepository.findOneBy({ email: dto.email });
            if (existing)
                throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.USER_EMAIL_TAKEN, 'El email ya está en uso');
            auditBefore.email = user.email;
            auditAfter.email = dto.email;
            user.email = dto.email;
        }
        if (dto.username !== undefined && dto.username !== user.username) {
            const existing = await this.userRepository.findOneBy({ username: dto.username });
            if (existing)
                throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.USERNAME_TAKEN, 'El username ya está en uso');
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
            metadata: Object.keys(auditAfter).length > 0 ? { before: auditBefore, after: auditAfter } : null,
        });
        return user_response_dto_1.UserResponseDto.from(saved);
    }
    async remove(id, currentUser) {
        const user = await this.userRepository.findOne({ where: { id, isSystemUser: false } });
        if (!user)
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.USER_NOT_FOUND, `Usuario ${id} no encontrado`);
        if (user.isProtected && !currentUser.isSystemUser) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.USER_PROTECTED, 'No podés eliminar un usuario protegido');
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
        await this.userRepository.softDelete(id);
        return { message: 'Usuario eliminado correctamente' };
    }
    async updateProfile(currentUser, dto) {
        const user = await this.userRepository.findOne({ where: { id: currentUser.id } });
        if (!user)
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.USER_NOT_FOUND, 'Usuario no encontrado');
        const auditBefore = {};
        const auditAfter = {};
        if (dto.email !== undefined && dto.email !== user.email) {
            const existing = await this.userRepository.findOneBy({ email: dto.email });
            if (existing)
                throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.USER_EMAIL_TAKEN, 'El email ya está en uso');
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
            metadata: Object.keys(auditAfter).length > 0 ? { before: auditBefore, after: auditAfter } : null,
        });
        return user_response_dto_1.UserResponseDto.from(saved);
    }
    async uploadAvatar(userId, file, alt) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.USER_NOT_FOUND, `Usuario ${userId} no encontrado`);
        }
        const avatar = await this.mediaService.upload(file, userId, {
            alt: alt || `Avatar de ${user.firstName || user.email}`,
            usage: 'avatars',
        });
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
        user.avatarUrl = avatar.url;
        const saved = await this.userRepository.save(user);
        await this.auditService.log({
            action: 'update_avatar',
            entity: 'User',
            entityId: saved.id,
            userId,
            metadata: { avatarUrl: avatar.url },
        });
        return user_response_dto_1.UserResponseDto.from(saved);
    }
    async removeAvatar(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.USER_NOT_FOUND, `Usuario ${userId} no encontrado`);
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
        return user_response_dto_1.UserResponseDto.from(user);
    }
    async updateLastLogin(id) {
        await this.userRepository.update(id, { lastLoginAt: new Date() });
    }
    async updatePassword(id, hashedPassword) {
        await this.userRepository.update(id, { password: hashedPassword });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService,
        media_service_1.MediaService,
        event_emitter_1.EventEmitter2])
], UsersService);
//# sourceMappingURL=users.service.js.map