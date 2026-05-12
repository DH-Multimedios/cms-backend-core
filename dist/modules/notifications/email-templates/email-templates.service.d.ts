import { Repository } from 'typeorm';
import { EmailTemplate } from '../../../database/entities/email-template.entity';
import { EmailLayout } from '../../../database/entities/email-layout.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { ListEmailTemplatesDto } from './dto/list-email-templates.dto';
import { TemplateRendererService } from '../template-renderer.service';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
export declare class EmailTemplatesService {
    private readonly repository;
    private readonly layoutRepository;
    private readonly renderer;
    constructor(repository: Repository<EmailTemplate>, layoutRepository: Repository<EmailLayout>, renderer: TemplateRendererService);
    findAll(query?: ListEmailTemplatesDto): Promise<PaginatedResult<EmailTemplate>>;
    findOne(id: number): Promise<EmailTemplate>;
    findByType(entityType: string, notificationType: string): Promise<EmailTemplate | null>;
    create(dto: CreateEmailTemplateDto): Promise<EmailTemplate>;
    update(id: number, dto: UpdateEmailTemplateDto): Promise<EmailTemplate>;
    remove(id: number): Promise<{
        message: string;
    }>;
    compileAndSave(template: EmailTemplate): Promise<EmailTemplate>;
}
//# sourceMappingURL=email-templates.service.d.ts.map