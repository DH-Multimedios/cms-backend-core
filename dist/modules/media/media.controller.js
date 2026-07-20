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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const media_service_1 = require("./media.service");
const dto_1 = require("./dto");
const session_auth_guard_1 = require("../auth/guards/session-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../auth/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async upload(file, dto, user) {
        return this.mediaService.upload(file, user.id, {
            alt: dto.alt,
            usage: dto.usage,
        });
    }
    async findAll(filters, user) {
        const hasListPermission = user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'media.list'));
        return this.mediaService.findAll(filters, user?.id, hasListPermission);
    }
    async findOne(id, user) {
        const hasReadPermission = user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'media.read'));
        return this.mediaService.findOne(id, user?.id, hasReadPermission);
    }
    async update(id, dto, user) {
        const hasEditPermission = user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'media.edit'));
        return this.mediaService.update(id, dto, user.id, hasEditPermission);
    }
    async remove(id, user) {
        const hasDeletePermission = user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'media.delete'));
        await this.mediaService.remove(id, user.id, hasDeletePermission);
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('media.upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Subir una imagen' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                alt: { type: 'string', example: 'Logo de la empresa en fondo blanco' },
                usage: { type: 'string', example: 'logos', nullable: true },
            },
            required: ['file', 'alt'],
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UploadMediaDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar imágenes — con permiso media.list ve todas, sin permiso solo las suyas',
    }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ListMediaDto, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalles de una imagen' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('media.edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Editar el texto alternativo (alt) de una imagen' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateMediaDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiCookieAuth)('session'),
    (0, require_permissions_decorator_1.RequirePermissions)('media.delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar imagen — borra el archivo físico y el registro' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "remove", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media'),
    (0, common_1.UseGuards)(session_auth_guard_1.SessionAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map