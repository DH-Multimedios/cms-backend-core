import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from '../../database/entities/setting.entity';
import { SettingCategory } from '../../database/entities/setting-category.entity';
import { Media } from '../../database/entities/media.entity';
import { AuditModule } from '../audit/audit.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingCategoriesController } from './setting-categories.controller';

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
