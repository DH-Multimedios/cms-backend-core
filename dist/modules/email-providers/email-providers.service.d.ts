import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EmailProvider } from '../../database/entities/email-provider.entity';
import { AuditService } from '../audit/audit.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateEmailProviderDto } from './dto/create-email-provider.dto';
import { UpdateEmailProviderDto } from './dto/update-email-provider.dto';
export declare class EmailProvidersService implements OnModuleInit {
    private readonly repository;
    private readonly auditService;
    private readonly permissionsService;
    constructor(repository: Repository<EmailProvider>, auditService: AuditService, permissionsService: PermissionsService);
    onModuleInit(): Promise<void>;
    findAll(): Promise<EmailProvider[]>;
    findOne(id: number): Promise<EmailProvider>;
    findActive(): Promise<EmailProvider | null>;
    create(dto: CreateEmailProviderDto): Promise<EmailProvider>;
    update(id: number, dto: UpdateEmailProviderDto): Promise<EmailProvider>;
    activate(id: number): Promise<EmailProvider>;
    remove(id: number): Promise<void>;
    private extractConfig;
}
//# sourceMappingURL=email-providers.service.d.ts.map