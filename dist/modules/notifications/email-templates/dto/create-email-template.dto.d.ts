import { Section } from '../../../../database/entities/notification-block.types';
export declare class CreateEmailTemplateDto {
    entityType: string;
    notificationType: string;
    name: string;
    subject: string;
    headerId?: number | null;
    footerId?: number | null;
    bodySections: Section[];
    variables?: string[];
}
//# sourceMappingURL=create-email-template.dto.d.ts.map