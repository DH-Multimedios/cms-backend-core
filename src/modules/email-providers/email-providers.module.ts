import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailProvider } from '../../database/entities/email-provider.entity';
import { AuditModule } from '../audit/audit.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { EmailProvidersService } from './email-providers.service';
import { EmailProvidersController } from './email-providers.controller';

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
