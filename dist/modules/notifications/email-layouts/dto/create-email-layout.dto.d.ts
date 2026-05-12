import { EmailLayoutType } from '../../../../database/entities/email-layout.entity';
import { Section } from '../../../../database/entities/notification-block.types';
export declare class CreateEmailLayoutDto {
    type: EmailLayoutType;
    name: string;
    sections: Section[];
    isDefault?: boolean;
}
//# sourceMappingURL=create-email-layout.dto.d.ts.map