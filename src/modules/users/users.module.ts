import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { AuditModule } from '../audit/audit.module';
import { MediaModule } from '../media/media.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

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
