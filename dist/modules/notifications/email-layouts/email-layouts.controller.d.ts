import { EmailLayoutsService } from './email-layouts.service';
import { CreateEmailLayoutDto } from './dto/create-email-layout.dto';
import { UpdateEmailLayoutDto } from './dto/update-email-layout.dto';
import { EmailLayoutType } from '../../../database/entities/email-layout.entity';
export declare class EmailLayoutsController {
    private readonly service;
    constructor(service: EmailLayoutsService);
    findAll(type?: EmailLayoutType): Promise<import("../../..").EmailLayout[]>;
    findOne(id: number): Promise<import("../../..").EmailLayout>;
    create(dto: CreateEmailLayoutDto): Promise<import("../../..").EmailLayout>;
    update(id: number, dto: UpdateEmailLayoutDto): Promise<import("../../..").EmailLayout>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=email-layouts.controller.d.ts.map