import { Repository } from 'typeorm';
import { EmailLayout, EmailLayoutType } from '../../../database/entities/email-layout.entity';
import { CreateEmailLayoutDto } from './dto/create-email-layout.dto';
import { UpdateEmailLayoutDto } from './dto/update-email-layout.dto';
export declare class EmailLayoutsService {
    private readonly repository;
    constructor(repository: Repository<EmailLayout>);
    findAll(type?: EmailLayoutType): Promise<EmailLayout[]>;
    findOne(id: number): Promise<EmailLayout>;
    create(dto: CreateEmailLayoutDto): Promise<EmailLayout>;
    update(id: number, dto: UpdateEmailLayoutDto): Promise<EmailLayout>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=email-layouts.service.d.ts.map