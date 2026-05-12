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
exports.ReorderTaxonomiesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ReorderTaxonomiesDto {
    ids;
}
exports.ReorderTaxonomiesDto = ReorderTaxonomiesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [String],
        description: 'Array de UUIDs en el orden deseado — todos deben ser del mismo nivel (mismo parentId)',
        example: ['uuid-1', 'uuid-2', 'uuid-3'],
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('all', { each: true }),
    __metadata("design:type", Array)
], ReorderTaxonomiesDto.prototype, "ids", void 0);
//# sourceMappingURL=reorder-taxonomies.dto.js.map