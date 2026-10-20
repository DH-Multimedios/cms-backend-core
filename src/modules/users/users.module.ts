import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { User } from '../../database/entities/user.entity.js';
import { Role } from '../../database/entities/role.entity.js';
import { AuditModule } from '../audit/audit.module.js';
import { MediaModule } from '../media/media.module.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    MulterModule.register({ storage: memoryStorage() }),
    AuditModule,
    MediaModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
