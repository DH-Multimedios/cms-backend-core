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
exports.NotificationTypesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_types_service_1 = require("./notification-types.service");
const create_notification_type_dto_1 = require("./dto/create-notification-type.dto");
const update_notification_type_dto_1 = require("./dto/update-notification-type.dto");
const session_auth_guard_1 = require("../../auth/guards/session-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const public_decorator_1 = require("../../auth/decorators/public.decorator");
let NotificationTypesController = class NotificationTypesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.NotificationTypesController = NotificationTypesController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar tipos de notificación (público — usado en panel de preferencias)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tipo por ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificationTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nuevo tipo de notificación' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_notification_type_dto_1.CreateNotificationTypeDto]),
    __metadata("design:returntype", void 0)
], NotificationTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar tipo — incluye toggle isEnabled' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_notification_type_dto_1.UpdateNotificationTypeDto]),
    __metadata("design:returntype", void 0)
], NotificationTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, require_permissions_decorator_1.RequirePermissions)('notifications.manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar tipo de notificación' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificationTypesController.prototype, "remove", null);
exports.NotificationTypesController = NotificationTypesController = __decorate([
    (0, swagger_1.ApiTags)('Notification Types'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('notification-types'),
    __metadata("design:paramtypes", [notification_types_service_1.NotificationTypesService])
], NotificationTypesController);
//# sourceMappingURL=notification-types.controller.js.map