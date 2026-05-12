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
exports.EntityTaxonomy = void 0;
const typeorm_1 = require("typeorm");
const taxonomy_entity_1 = require("./taxonomy.entity");
let EntityTaxonomy = class EntityTaxonomy {
    id;
    entityType;
    entityId;
    taxonomyId;
    taxonomy;
    createdAt;
};
exports.EntityTaxonomy = EntityTaxonomy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EntityTaxonomy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], EntityTaxonomy.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], EntityTaxonomy.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], EntityTaxonomy.prototype, "taxonomyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taxonomy_entity_1.Taxonomy, { eager: false, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taxonomyId' }),
    __metadata("design:type", taxonomy_entity_1.Taxonomy)
], EntityTaxonomy.prototype, "taxonomy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EntityTaxonomy.prototype, "createdAt", void 0);
exports.EntityTaxonomy = EntityTaxonomy = __decorate([
    (0, typeorm_1.Entity)('entity_taxonomies'),
    (0, typeorm_1.Unique)(['entityType', 'entityId', 'taxonomyId'])
], EntityTaxonomy);
//# sourceMappingURL=entity-taxonomy.entity.js.map