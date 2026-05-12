import { Section } from './notification-block.types';
export type EmailLayoutType = 'header' | 'footer';
export declare class EmailLayout {
    id: number;
    type: EmailLayoutType;
    name: string;
    sections: Section[];
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=email-layout.entity.d.ts.map