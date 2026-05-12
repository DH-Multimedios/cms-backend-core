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
exports.NotificationTypesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_type_entity_1 = require("../../../database/entities/notification-type.entity");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../../common/enums/error-codes.enum");
let NotificationTypesService = class NotificationTypesService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    findAll() {
        return this.repository.find({ order: { entityType: 'ASC', notificationType: 'ASC' } });
    }
    async findOne(id) {
        const type = await this.repository.findOneBy({ id });
        if (!type) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Tipo de notificación ${id} no encontrado`);
        }
        return type;
    }
    async findByKey(key) {
        return this.repository.findOneBy({ key });
    }
    async create(dto) {
        const existing = await this.repository.findOneBy({ key: dto.key });
        if (existing) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.CONFLICT, error_codes_enum_1.ErrorCode.CONFLICT, `Ya existe un tipo con key '${dto.key}'`);
        }
        const type = this.repository.create(dto);
        return this.repository.save(type);
    }
    async update(id, dto) {
        const type = await this.findOne(id);
        Object.assign(type, dto);
        return this.repository.save(type);
    }
    async remove(id) {
        const type = await this.findOne(id);
        await this.repository.remove(type);
        return { message: `Tipo '${type.key}' eliminado correctamente` };
    }
};
exports.NotificationTypesService = NotificationTypesService;
exports.NotificationTypesService = NotificationTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_type_entity_1.NotificationType)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationTypesService);
//# sourceMappingURL=notification-types.service.js.map