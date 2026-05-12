import { EmailProvidersService } from './email-providers.service';
import { CreateEmailProviderDto } from './dto/create-email-provider.dto';
import { UpdateEmailProviderDto } from './dto/update-email-provider.dto';
export declare class EmailProvidersController {
    private readonly service;
    constructor(service: EmailProvidersService);
    findAll(): Promise<import("../..").EmailProvider[]>;
    findActive(): Promise<import("../..").EmailProvider | null>;
    findOne(id: number): Promise<import("../..").EmailProvider>;
    create(dto: CreateEmailProviderDto): Promise<import("../..").EmailProvider>;
    update(id: number, dto: UpdateEmailProviderDto): Promise<import("../..").EmailProvider>;
    activate(id: number): Promise<import("../..").EmailProvider>;
    remove(id: number): Promise<void>;
}
//# sourceMappingURL=email-providers.controller.d.ts.map