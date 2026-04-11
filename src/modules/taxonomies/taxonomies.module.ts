import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taxonomy } from '../../database/entities/taxonomy.entity';
import { EntityTaxonomy } from '../../database/entities/entity-taxonomy.entity';
import { AuditModule } from '../audit/audit.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { TaxonomiesService } from './taxonomies.service';
import { TaxonomiesController } from './taxonomies.controller';

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
