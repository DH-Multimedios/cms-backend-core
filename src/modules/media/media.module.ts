import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Media } from '../../database/entities/media.entity.js';
import { MediaService } from './media.service.js';
import { MediaController } from './media.controller.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    MulterModule.register({
      storage: memoryStorage(), // Guardamos en memoria para validar y procesar con Sharp antes de escribir
    }),
    SettingsModule,
    AuditModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
