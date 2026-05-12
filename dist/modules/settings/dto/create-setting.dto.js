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
exports.CreateSettingDto = exports.SettingMetaDto = exports.SettingMetaOptionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const SETTING_TYPES = ['string', 'number', 'boolean', 'json', 'password'];
const INPUT_TYPES = [
    'text', 'textarea', 'number', 'password', 'toggle',
    'checkbox', 'radio', 'select', 'color', 'url', 'email', 'date', 'image', 'stringArray',
];
class SettingMetaOptionDto {
    value;
    label;
}
exports.SettingMetaOptionDto = SettingMetaOptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingMetaOptionDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SettingMetaOptionDto.prototype, "label", void 0);
class SettingMetaDto {
    options;
    rows;
    min;
    max;
}
exports.SettingMetaDto = SettingMetaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [SettingMetaOptionDto], description: 'Opciones para select, radio y checkbox' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SettingMetaOptionDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SettingMetaDto.prototype, "options", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filas para textarea' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SettingMetaDto.prototype, "rows", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Valor mínimo para number' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SettingMetaDto.prototype, "min", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Valor máximo para number' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SettingMetaDto.prototype, "max", void 0);
class CreateSettingDto {
    categoryId;
    key;
    label;
    value;
    description;
    type;
    inputType;
    meta;
    order;
}
exports.CreateSettingDto = CreateSettingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de la categoría' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSettingDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'app.name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nombre de la aplicación' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mi App' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: SETTING_TYPES, default: 'string' }),
    (0, class_validator_1.IsIn)(SETTING_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: INPUT_TYPES, default: 'text' }),
    (0, class_validator_1.IsIn)(INPUT_TYPES),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSettingDto.prototype, "inputType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: SettingMetaDto,
        description: 'select/radio/checkbox: { options }  |  textarea: { rows }  |  number: { min, max }',
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SettingMetaDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSettingDto.prototype, "meta", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSettingDto.prototype, "order", void 0);
//# sourceMappingURL=create-setting.dto.js.map