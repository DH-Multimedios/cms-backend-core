import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Media } from '../../database/entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { SettingsModule } from '../settings/settings.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    MulterModule.register({
      storage: 'memory', // Guardamos en memoria para validar y procesar con Sharp antes de escribir
    }),
    SettingsModule,
    AuditModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
