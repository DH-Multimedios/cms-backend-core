import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreference } from '../../database/entities/user-preference.entity.js';
import { UserPreferencesService } from './user-preferences.service.js';
import { UserPreferencesController } from './user-preferences.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreference])],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService],
  exports: [UserPreferencesService],
})
export class UserPreferencesModule {}
