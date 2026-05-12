import { Repository } from 'typeorm';
import { NotificationType } from '../../../database/entities/notification-type.entity';
import { CreateNotificationTypeDto } from './dto/create-notification-type.dto';
import { UpdateNotificationTypeDto } from './dto/update-notification-type.dto';
export declare class NotificationTypesService {
    private readonly repository;
    constructor(repository: Repository<NotificationType>);
    findAll(): Promise<NotificationType[]>;
    findOne(id: number): Promise<NotificationType>;
    findByKey(key: string): Promise<NotificationType | null>;
    create(dto: CreateNotificationTypeDto): Promise<NotificationType>;
    update(id: number, dto: UpdateNotificationTypeDto): Promise<NotificationType>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notification-types.service.d.ts.map