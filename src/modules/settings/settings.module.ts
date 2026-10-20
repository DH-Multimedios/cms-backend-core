import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from '../../database/entities/setting.entity.js';
import { SettingCategory } from '../../database/entities/setting-category.entity.js';
import { Media } from '../../database/entities/media.entity.js';
import { AuditModule } from '../audit/audit.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { SettingsService } from './settings.service.js';
import { SettingsController } from './settings.controller.js';
import { SettingCategoriesController } from './setting-categories.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, SettingCategory, Media]),
    AuditModule,
    PermissionsModule,
  ],
  controllers: [SettingsController, SettingCategoriesController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
