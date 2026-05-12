"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProvidersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const email_provider_entity_1 = require("../../database/entities/email-provider.entity");
const audit_module_1 = require("../audit/audit.module");
const permissions_module_1 = require("../permissions/permissions.module");
const email_providers_service_1 = require("./email-providers.service");
const email_providers_controller_1 = require("./email-providers.controller");
let EmailProvidersModule = class EmailProvidersModule {
};
exports.EmailProvidersModule = EmailProvidersModule;
exports.EmailProvidersModule = EmailProvidersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([email_provider_entity_1.EmailProvider]),
            audit_module_1.AuditModule,
            permissions_module_1.PermissionsModule,
        ],
        controllers: [email_providers_controller_1.EmailProvidersController],
        providers: [email_providers_service_1.EmailProvidersService],
        exports: [email_providers_service_1.EmailProvidersService],
    })
], EmailProvidersModule);
//# sourceMappingURL=email-providers.module.js.map