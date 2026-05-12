"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomiesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const taxonomy_entity_1 = require("../../database/entities/taxonomy.entity");
const entity_taxonomy_entity_1 = require("../../database/entities/entity-taxonomy.entity");
const audit_module_1 = require("../audit/audit.module");
const permissions_module_1 = require("../permissions/permissions.module");
const taxonomies_service_1 = require("./taxonomies.service");
const taxonomies_controller_1 = require("./taxonomies.controller");
let TaxonomiesModule = class TaxonomiesModule {
};
exports.TaxonomiesModule = TaxonomiesModule;
exports.TaxonomiesModule = TaxonomiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([taxonomy_entity_1.Taxonomy, entity_taxonomy_entity_1.EntityTaxonomy]),
            audit_module_1.AuditModule,
            permissions_module_1.PermissionsModule,
        ],
        controllers: [taxonomies_controller_1.TaxonomiesController],
        providers: [taxonomies_service_1.TaxonomiesService],
        exports: [taxonomies_service_1.TaxonomiesService],
    })
], TaxonomiesModule);
//# sourceMappingURL=taxonomies.module.js.map