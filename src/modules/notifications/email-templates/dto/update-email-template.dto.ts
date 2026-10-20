import { PartialType } from '@nestjs/swagger';
import { CreateEmailTemplateDto } from './create-email-template.dto.js';

export class UpdateEmailTemplateDto extends PartialType(CreateEmailTemplateDto) {}
