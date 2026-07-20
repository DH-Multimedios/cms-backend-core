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
exports.TaxonomiesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const taxonomies_service_1 = require("./taxonomies.service");
const create_taxonomy_dto_1 = require("./dto/create-taxonomy.dto");
const update_taxonomy_dto_1 = require("./dto/update-taxonomy.dto");
const query_taxonomy_dto_1 = require("./dto/query-taxonomy.dto");
const reorder_taxonomies_dto_1 = require("./dto/reorder-taxonomies.dto");
const sync_entity_taxonomies_dto_1 = require("./dto/sync-entity-taxonomies.dto");
const session_auth_guard_1 = require("../auth/guards/session-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../auth/decorators/require-permissions.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let TaxonomiesController = class TaxonomiesController {
    taxonomiesService;
    constructor(taxonomiesService) {
        this.taxonomiesService = taxonomiesService;
    }
    findForEntity(entityType, entityId) {
        return this.taxonomiesService.findForEntity(entityType, entityId);
    }
    syncEntity(entityType, entityId, dto) {
        return this.taxonomiesService.syncEntity(entityType, entityId, dto.taxonomyIds);
    }
    reorder(dto) {
        return this.taxonomiesService.reorder(dto);
    }
    findAll(query) {
        return this.taxonomiesService.findAll(query);
    }
    findOne(id) {
        return this.taxonomiesService.findOne(id);
    }
    create(dto) {
        return this.taxonomiesService.create(dto);
    }
    update(id, dto) {
        return this.taxonomiesService.update(id, dto);
    }
    remove(id) {
        return this.taxonomiesService.remove(id);
    }
};
exports.TaxonomiesController = TaxonomiesController;
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener taxonomías asociadas a una entidad (público)' }),
    (0, swagger_1.ApiParam)({ name: 'entityType', example: 'Product' }),
    (0, swagger_1.ApiParam)({ name: 'entityId', example: 'uuid' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TaxonomiesController.prototype, "findForEntity", null);
__decorate([
    (0, common_1.Put)('entity/:entityType/:entityId'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('taxonomies.update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Sincronizar taxonomías de una entidad — reemplaza todas las existentes',
    }),
    (0, swagger_1.ApiParam)({ name: 'entityType', example: 'Product' }),
    (0, swagger_1.ApiParam)({ name: 'entityId', example: 'uuid' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, sync_entity_taxonomies_dto_1.SyncEntityTaxonomiesDto]),
    __metadata("design:returntype", void 0)
], TaxonomiesController.prototype, "syncEntity", null);
__decorate([
    (0, common_1.Patch)('reorder'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('taxonomies.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Reordenar taxonomías — enviar IDs en el orden deseado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reorder_taxonomies_dto_1.ReorderTaxonomiesDto]),
    __metadata("design:returntype", void 0)
], TaxonomiesController.prototype, "reorder", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar taxonomías con paginación y filtros (público)' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: 'Filtrar por vocabulario' }),
    (0, swagger_1.ApiQuery)({ name: 'parentId', required: false, description: 'Filtrar por UUID del padre' }),
    (0, swagger_1.ApiQuery)({ name: 'root', required: false, description: 'true → solo nodos raíz' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_taxonomy_dto_1.QueryTaxonomyDto]),
    __metadata("design:returntype", void 0)
], TaxonomiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener taxonomía por ID con conteo de hijos (público)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaxonomiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('taxonomies.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear taxonomía (slug auto-generado si no se envía)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_taxonomy_dto_1.CreateTaxonomyDto]),
    __metadata("design:returntype", void 0)
], TaxonomiesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('taxonomies.update'),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar taxonomía — slug se regenera si cambia el name y no se envía slug',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_taxonomy_dto_1.UpdateTaxonomyDto]),
    __metadata("design:returntype", void 0)
], TaxonomiesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('taxonomies.delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar taxonomía — falla si tiene hijos' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaxonomiesController.prototype, "remove", null);
exports.TaxonomiesController = TaxonomiesController = __decorate([
    (0, swagger_1.ApiTags)('Taxonomies'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('taxonomies'),
    __metadata("design:paramtypes", [taxonomies_service_1.TaxonomiesService])
], TaxonomiesController);
//# sourceMappingURL=taxonomies.controller.js.map