import { EmailLayout } from './email-layout.entity';
import { Section } from './notification-block.types';
export declare class EmailTemplate {
    id: number;
    entityType: string;
    notificationType: string;
    name: string;
    subject: string;
    headerId: number | null;
    header: EmailLayout | null;
    footerId: number | null;
    footer: EmailLayout | null;
    bodySections: Section[];
    variables: string[];
    compiledHtml: string | null;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=email-template.entity.d.ts.map