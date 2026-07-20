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
exports.EmailProvidersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_providers_service_1 = require("./email-providers.service");
const create_email_provider_dto_1 = require("./dto/create-email-provider.dto");
const update_email_provider_dto_1 = require("./dto/update-email-provider.dto");
const session_auth_guard_1 = require("../auth/guards/session-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../auth/decorators/require-permissions.decorator");
let EmailProvidersController = class EmailProvidersController {
    service;
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    findActive() {
        return this.service.findActive();
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
    activate(id) {
        return this.service.activate(id);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.EmailProvidersController = EmailProvidersController;
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('email-providers.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar providers de email' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailProvidersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, require_permissions_decorator_1.RequirePermissions)('email-providers.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el provider activo' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EmailProvidersController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('email-providers.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener provider por ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmailProvidersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('email-providers.create'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear provider de email' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_email_provider_dto_1.CreateEmailProviderDto]),
    __metadata("design:returntype", void 0)
], EmailProvidersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('email-providers.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar provider de email' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_email_provider_dto_1.UpdateEmailProviderDto]),
    __metadata("design:returntype", void 0)
], EmailProvidersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, require_permissions_decorator_1.RequirePermissions)('email-providers.update'),
    (0, swagger_1.ApiOperation)({ summary: 'Activar este provider (desactiva los demás)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmailProvidersController.prototype, "activate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('email-providers.delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar provider (no puede estar activo)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EmailProvidersController.prototype, "remove", null);
exports.EmailProvidersController = EmailProvidersController = __decorate([
    (0, swagger_1.ApiTags)('Email Providers'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('email-providers'),
    __metadata("design:paramtypes", [email_providers_service_1.EmailProvidersService])
], EmailProvidersController);
//# sourceMappingURL=email-providers.controller.js.map