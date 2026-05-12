import { EmailProviderType } from '../../../database/entities/email-provider.entity';
import { SmtpConfigDto } from './smtp-config.dto';
import { ResendConfigDto } from './resend-config.dto';
import { GoogleOAuthConfigDto } from './google-oauth-config.dto';
export declare class CreateEmailProviderDto {
    name: string;
    provider: EmailProviderType;
    from?: string;
    smtp?: SmtpConfigDto;
    resend?: ResendConfigDto;
    googleOAuth?: GoogleOAuthConfigDto;
}
//# sourceMappingURL=create-email-provider.dto.d.ts.map