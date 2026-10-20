import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailProvider } from '../../database/entities/email-provider.entity.js';
import { AuditModule } from '../audit/audit.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { EmailProvidersService } from './email-providers.service.js';
import { EmailProvidersController } from './email-providers.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailProvider]),
    AuditModule,
    PermissionsModule,
  ],
  controllers: [EmailProvidersController],
  providers: [EmailProvidersService],
  exports: [EmailProvidersService],
})
export class EmailProvidersModule {}
