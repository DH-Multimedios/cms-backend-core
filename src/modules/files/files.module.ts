import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { File } from '../../database/entities/file.entity.js';
import { User } from '../../database/entities/user.entity.js';
import { FilesService } from './files.service.js';
import { FilesController } from './files.controller.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, User]),
    MulterModule.register({
      storage: memoryStorage(), // Guardamos en memoria para validar antes de escribir a disco
    }),
    SettingsModule,
    AuditModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
