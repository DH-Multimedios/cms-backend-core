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
exports.CreateEmailTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEmailTemplateDto {
    entityType;
    notificationType;
    name;
    subject;
    headerId;
    footerId;
    bodySections;
    variables;
}
exports.CreateEmailTemplateDto = CreateEmailTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailTemplateDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'welcome' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailTemplateDto.prototype, "notificationType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Email de bienvenida' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bienvenido {{firstName}}' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailTemplateDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID del header layout' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateEmailTemplateDto.prototype, "headerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID del footer layout' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateEmailTemplateDto.prototype, "footerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Secciones del body con columnas y bloques' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateEmailTemplateDto.prototype, "bodySections", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['firstName', 'verificationUrl'], description: 'Variables disponibles — documentación para el editor' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEmailTemplateDto.prototype, "variables", void 0);
//# sourceMappingURL=create-email-template.dto.js.map