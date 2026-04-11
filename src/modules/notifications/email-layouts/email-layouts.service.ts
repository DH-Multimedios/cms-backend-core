import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailLayout, EmailLayoutType } from '../../../database/entities/email-layout.entity';
import { CreateEmailLayoutDto } from './dto/create-email-layout.dto';
import { UpdateEmailLayoutDto } from './dto/update-email-layout.dto';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/enums/error-codes.enum';

@Injectable()
export class EmailLayoutsService {
  constructor(
    @InjectRepository(EmailLayout)
    private readonly repository: Repository<EmailLayout>,
  ) {}

  findAll(type?: EmailLayoutType): Promise<EmailLayout[]> {
    return this.repository.find({
      where: type ? { type } : undefined,
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<EmailLayout> {
    const layout = await this.repository.findOneBy({ id });
    if (!layout) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Layout ${id} no encontrado`);
    }
    return layout;
  }

  async create(dto: CreateEmailLayoutDto): Promise<EmailLayout> {
    const layout = this.repository.create(dto);
    return this.repository.save(layout);
  }

  async update(id: number, dto: UpdateEmailLayoutDto): Promise<EmailLayout> {
    const layout = await this.findOne(id);
    Object.assign(layout, dto);
    return this.repository.save(layout);
  }

  async remove(id: number): Promise<{ message: string }> {
    const layout = await this.findOne(id);
    await this.repository.remove(layout);
    return { message: `Layout '${layout.name}' eliminado correctamente` };
  }
}
