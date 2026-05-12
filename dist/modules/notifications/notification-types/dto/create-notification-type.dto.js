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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotificationTypeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateNotificationTypeDto {
    key;
    entityType;
    notificationType;
    name;
    description;
    userConfigurable;
    defaultEnabled;
}
exports.CreateNotificationTypeDto = CreateNotificationTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user.welcome' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTypeDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTypeDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'welcome' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTypeDto.prototype, "notificationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Email de bienvenida' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateNotificationTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationTypeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true, description: 'El usuario puede desactivarlo desde su perfil' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateNotificationTypeDto.prototype, "userConfigurable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true, description: 'Activo por defecto para usuarios nuevos' }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateNotificationTypeDto.prototype, "defaultEnabled", void 0);
//# sourceMappingURL=create-notification-type.dto.js.map