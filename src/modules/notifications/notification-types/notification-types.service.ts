import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from '../../../database/entities/notification-type.entity';
import { CreateNotificationTypeDto } from './dto/create-notification-type.dto';
import { UpdateNotificationTypeDto } from './dto/update-notification-type.dto';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/enums/error-codes.enum';

@Injectable()
export class NotificationTypesService {
  constructor(
    @InjectRepository(NotificationType)
    private readonly repository: Repository<NotificationType>,
  ) {}

  findAll(): Promise<NotificationType[]> {
    return this.repository.find({ order: { entityType: 'ASC', notificationType: 'ASC' } });
  }

  async findOne(id: number): Promise<NotificationType> {
    const type = await this.repository.findOneBy({ id });
    if (!type) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Tipo de notificación ${id} no encontrado`);
    }
    return type;
  }

  async findByKey(key: string): Promise<NotificationType | null> {
    return this.repository.findOneBy({ key });
  }

  async create(dto: CreateNotificationTypeDto): Promise<NotificationType> {
    const existing = await this.repository.findOneBy({ key: dto.key });
    if (existing) {
      throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, `Ya existe un tipo con key '${dto.key}'`);
    }
    const type = this.repository.create(dto);
    return this.repository.save(type);
  }

  async update(id: number, dto: UpdateNotificationTypeDto): Promise<NotificationType> {
    const type = await this.findOne(id);
    Object.assign(type, dto);
    return this.repository.save(type);
  }

  async remove(id: number): Promise<{ message: string }> {
    const type = await this.findOne(id);
    await this.repository.remove(type);
    return { message: `Tipo '${type.key}' eliminado correctamente` };
  }
}
