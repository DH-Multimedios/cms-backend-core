"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmailProviderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_email_provider_dto_1 = require("./create-email-provider.dto");
class UpdateEmailProviderDto extends (0, swagger_1.PartialType)(create_email_provider_dto_1.CreateEmailProviderDto) {
}
exports.UpdateEmailProviderDto = UpdateEmailProviderDto;
//# sourceMappingURL=update-email-provider.dto.js.map