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
exports.NotificationPreferencesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_preferences_service_1 = require("./notification-preferences.service");
const upsert_notification_preference_dto_1 = require("./dto/upsert-notification-preference.dto");
const session_auth_guard_1 = require("../../auth/guards/session-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const user_entity_1 = require("../../../database/entities/user.entity");
let NotificationPreferencesController = class NotificationPreferencesController {
    service;
    constructor(service) {
        this.service = service;
    }
    findMine(user) {
        return this.service.findForUser(user.id);
    }
    upsert(user, dto) {
        return this.service.upsert(user.id, dto);
    }
};
exports.NotificationPreferencesController = NotificationPreferencesController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Ver mis preferencias de notificación' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], NotificationPreferencesController.prototype, "findMine", null);
__decorate([
    (0, common_1.Put)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear o actualizar una preferencia de notificación' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, upsert_notification_preference_dto_1.UpsertNotificationPreferenceDto]),
    __metadata("design:returntype", void 0)
], NotificationPreferencesController.prototype, "upsert", null);
exports.NotificationPreferencesController = NotificationPreferencesController = __decorate([
    (0, swagger_1.ApiTags)('Notification Preferences'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('notification-preferences'),
    __metadata("design:paramtypes", [notification_preferences_service_1.NotificationPreferencesService])
], NotificationPreferencesController);
//# sourceMappingURL=notification-preferences.controller.js.map