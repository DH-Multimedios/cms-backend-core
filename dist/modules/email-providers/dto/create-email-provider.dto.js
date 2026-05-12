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
exports.CreateEmailProviderDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const smtp_config_dto_1 = require("./smtp-config.dto");
const resend_config_dto_1 = require("./resend-config.dto");
const google_oauth_config_dto_1 = require("./google-oauth-config.dto");
const PROVIDER_TYPES = ['smtp', 'resend', 'google-oauth'];
class CreateEmailProviderDto {
    name;
    provider;
    from;
    smtp;
    resend;
    googleOAuth;
}
exports.CreateEmailProviderDto = CreateEmailProviderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SMTP corporativo' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEmailProviderDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PROVIDER_TYPES }),
    (0, class_validator_1.IsIn)(PROVIDER_TYPES),
    __metadata("design:type", String)
], CreateEmailProviderDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'noreply@miapp.com' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailProviderDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: smtp_config_dto_1.SmtpConfigDto }),
    (0, class_validator_1.ValidateIf)((o) => o.provider === 'smtp'),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => smtp_config_dto_1.SmtpConfigDto),
    __metadata("design:type", smtp_config_dto_1.SmtpConfigDto)
], CreateEmailProviderDto.prototype, "smtp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: resend_config_dto_1.ResendConfigDto }),
    (0, class_validator_1.ValidateIf)((o) => o.provider === 'resend'),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => resend_config_dto_1.ResendConfigDto),
    __metadata("design:type", resend_config_dto_1.ResendConfigDto)
], CreateEmailProviderDto.prototype, "resend", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: google_oauth_config_dto_1.GoogleOAuthConfigDto }),
    (0, class_validator_1.ValidateIf)((o) => o.provider === 'google-oauth'),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => google_oauth_config_dto_1.GoogleOAuthConfigDto),
    __metadata("design:type", google_oauth_config_dto_1.GoogleOAuthConfigDto)
], CreateEmailProviderDto.prototype, "googleOAuth", void 0);
//# sourceMappingURL=create-email-provider.dto.js.map