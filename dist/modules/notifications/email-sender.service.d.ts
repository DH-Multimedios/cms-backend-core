import { EmailProvidersService } from '../email-providers/email-providers.service';
export interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare class EmailSenderService {
    private readonly emailProvidersService;
    private readonly logger;
    constructor(emailProvidersService: EmailProvidersService);
    send(options: SendEmailOptions): Promise<void>;
}
//# sourceMappingURL=email-sender.service.d.ts.map