import { NotificationTypesService } from './notification-types.service';
import { CreateNotificationTypeDto } from './dto/create-notification-type.dto';
import { UpdateNotificationTypeDto } from './dto/update-notification-type.dto';
export declare class NotificationTypesController {
    private readonly service;
    constructor(service: NotificationTypesService);
    findAll(): Promise<import("../../..").NotificationType[]>;
    findOne(id: number): Promise<import("../../..").NotificationType>;
    create(dto: CreateNotificationTypeDto): Promise<import("../../..").NotificationType>;
    update(id: number, dto: UpdateNotificationTypeDto): Promise<import("../../..").NotificationType>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=notification-types.controller.d.ts.map