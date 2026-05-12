"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaxonomyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_taxonomy_dto_1 = require("./create-taxonomy.dto");
class UpdateTaxonomyDto extends (0, swagger_1.PartialType)(create_taxonomy_dto_1.CreateTaxonomyDto) {
}
exports.UpdateTaxonomyDto = UpdateTaxonomyDto;
//# sourceMappingURL=update-taxonomy.dto.js.map