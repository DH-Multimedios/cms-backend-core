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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("../../database/entities/permission.entity");
let PermissionsService = class PermissionsService {
    permissionRepository;
    constructor(permissionRepository) {
        this.permissionRepository = permissionRepository;
    }
    async findList() {
        return this.permissionRepository
            .createQueryBuilder('permission')
            .select([
            'permission.id',
            'permission.name',
            'permission.description',
            'permission.module',
            'permission.moduleName',
        ])
            .orderBy('permission.module', 'ASC')
            .addOrderBy('permission.name', 'ASC')
            .getMany();
    }
    async findAll(query) {
        const { page = 1, limit = 20, sortOrder = 'DESC', sortBy = 'createdAt', search, module, } = query;
        const qb = this.permissionRepository.createQueryBuilder('permission');
        if (search) {
            qb.andWhere('permission.name ILIKE :search', { search: `%${search}%` });
        }
        if (module) {
            qb.andWhere('permission.module = :module', { module });
        }
        qb.orderBy(`permission.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    findOne(id) {
        return this.permissionRepository.findOneBy({ id });
    }
    findByIds(ids) {
        if (!ids.length)
            return Promise.resolve([]);
        return this.permissionRepository
            .createQueryBuilder('permission')
            .where('permission.id IN (:...ids)', { ids })
            .getMany();
    }
    async registerPermissions(permissions) {
        for (const def of permissions) {
            const exists = await this.permissionRepository.findOneBy({ name: def.name });
            if (!exists) {
                await this.permissionRepository.save(this.permissionRepository.create(def));
            }
            else if (def.moduleName && exists.moduleName !== def.moduleName) {
                exists.moduleName = def.moduleName;
                await this.permissionRepository.save(exists);
            }
        }
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map