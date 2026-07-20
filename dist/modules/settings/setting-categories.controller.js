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
exports.SettingCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("./settings.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const reorder_categories_dto_1 = require("./dto/reorder-categories.dto");
const session_auth_guard_1 = require("../auth/guards/session-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../auth/decorators/require-permissions.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let SettingCategoriesController = class SettingCategoriesController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    findAll(page = 1, limit = 20) {
        return this.settingsService.findAllCategories(Number(page), Number(limit));
    }
    findOne(slug, page = 1, limit = 20) {
        return this.settingsService.findCategoryBySlug(slug, Number(page), Number(limit));
    }
    create(dto) {
        return this.settingsService.createCategory(dto);
    }
    reorder(dto) {
        return this.settingsService.reorderCategories(dto);
    }
    update(id, dto) {
        return this.settingsService.updateCategory(id, dto);
    }
    remove(id) {
        return this.settingsService.removeCategory(id);
    }
};
exports.SettingCategoriesController = SettingCategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar categorías paginadas con cantidad de settings (público)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SettingCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener categoría por slug con sus settings paginados (público)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SettingCategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear categoría (slug auto-generado si no se envía)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], SettingCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Reordenar categorías — enviar IDs en el orden deseado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_categories_dto_1.ReorderCategoriesDto]),
    __metadata("design:returntype", void 0)
], SettingCategoriesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar categoría' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], SettingCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('settings.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar categoría (solo si no tiene settings)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SettingCategoriesController.prototype, "remove", null);
exports.SettingCategoriesController = SettingCategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Setting Categories'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('setting-categories'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingCategoriesController);
//# sourceMappingURL=setting-categories.controller.js.map