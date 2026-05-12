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
exports.CreateEmailLayoutDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const LAYOUT_TYPES = ['header', 'footer'];
class CreateEmailLayoutDto {
    type;
    name;
    sections;
    isDefault;
}
exports.CreateEmailLayoutDto = CreateEmailLayoutDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: LAYOUT_TYPES }),
    (0, class_validator_1.IsIn)(LAYOUT_TYPES),
    __metadata("design:type", String)
], CreateEmailLayoutDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Header corporativo' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailLayoutDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array de secciones con columnas y bloques' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateEmailLayoutDto.prototype, "sections", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateEmailLayoutDto.prototype, "isDefault", void 0);
//# sourceMappingURL=create-email-layout.dto.js.map