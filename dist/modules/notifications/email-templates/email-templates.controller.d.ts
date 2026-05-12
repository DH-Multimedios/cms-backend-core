import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { ListEmailTemplatesDto } from './dto/list-email-templates.dto';
export declare class EmailTemplatesController {
    private readonly service;
    constructor(service: EmailTemplatesService);
    findAll(query: ListEmailTemplatesDto): Promise<import("../../..").PaginatedResult<import("../../..").EmailTemplate>>;
    findOne(id: number): Promise<import("../../..").EmailTemplate>;
    create(dto: CreateEmailTemplateDto): Promise<import("../../..").EmailTemplate>;
    update(id: number, dto: UpdateEmailTemplateDto): Promise<import("../../..").EmailTemplate>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=email-templates.controller.d.ts.map