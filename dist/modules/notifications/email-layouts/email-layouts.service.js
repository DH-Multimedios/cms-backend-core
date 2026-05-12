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
exports.EmailLayoutsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const email_layout_entity_1 = require("../../../database/entities/email-layout.entity");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../../common/enums/error-codes.enum");
let EmailLayoutsService = class EmailLayoutsService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    findAll(type) {
        return this.repository.find({
            where: type ? { type } : undefined,
            order: { isDefault: 'DESC', createdAt: 'ASC' },
        });
    }
    async findOne(id) {
        const layout = await this.repository.findOneBy({ id });
        if (!layout) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, `Layout ${id} no encontrado`);
        }
        return layout;
    }
    async create(dto) {
        const layout = this.repository.create(dto);
        return this.repository.save(layout);
    }
    async update(id, dto) {
        const layout = await this.findOne(id);
        Object.assign(layout, dto);
        return this.repository.save(layout);
    }
    async remove(id) {
        const layout = await this.findOne(id);
        await this.repository.remove(layout);
        return { message: `Layout '${layout.name}' eliminado correctamente` };
    }
};
exports.EmailLayoutsService = EmailLayoutsService;
exports.EmailLayoutsService = EmailLayoutsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(email_layout_entity_1.EmailLayout)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EmailLayoutsService);
//# sourceMappingURL=email-layouts.service.js.map