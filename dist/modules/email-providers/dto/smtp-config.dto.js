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
exports.SmtpConfigDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SmtpConfigDto {
    host;
    port;
    user;
    pass;
    secure;
}
exports.SmtpConfigDto = SmtpConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'smtp.gmail.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "host", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 587 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(65535),
    __metadata("design:type", Number)
], SmtpConfigDto.prototype, "port", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usuario@gmail.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'mi-contraseña' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SmtpConfigDto.prototype, "pass", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false, description: 'true para port 465 (SSL), false para STARTTLS' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SmtpConfigDto.prototype, "secure", void 0);
//# sourceMappingURL=smtp-config.dto.js.map