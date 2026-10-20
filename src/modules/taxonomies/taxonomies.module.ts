import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taxonomy } from '../../database/entities/taxonomy.entity.js';
import { EntityTaxonomy } from '../../database/entities/entity-taxonomy.entity.js';
import { AuditModule } from '../audit/audit.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { TaxonomiesService } from './taxonomies.service.js';
import { TaxonomiesController } from './taxonomies.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Taxonomy, EntityTaxonomy]),
    AuditModule,
    PermissionsModule,
  ],
  controllers: [TaxonomiesController],
  providers: [TaxonomiesService],
  exports: [TaxonomiesService],
})
export class TaxonomiesModule {}
