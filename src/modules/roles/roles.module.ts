import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../database/entities/role.entity.js';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { RolesService } from './roles.service.js';
import { RolesController } from './roles.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PermissionsModule, AuditModule],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
