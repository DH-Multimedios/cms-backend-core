"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPreferencesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_notification_preference_entity_1 = require("../../../database/entities/user-notification-preference.entity");
const notification_type_entity_1 = require("../../../database/entities/notification-type.entity");
let NotificationPreferencesService = class NotificationPreferencesService {
    repository;
    notifTypeRepository;
    constructor(repository, notifTypeRepository) {
        this.repository = repository;
        this.notifTypeRepository = notifTypeRepository;
    }
    async findForUser(userId) {
        return this.repository.findBy({ userId });
    }
    async upsert(userId, dto) {
        let preference = await this.repository.findOneBy({
            userId,
            notificationTypeKey: dto.notificationTypeKey,
        });
        if (preference) {
            preference.enabled = dto.enabled;
        }
        else {
            preference = this.repository.create({
                userId,
                notificationTypeKey: dto.notificationTypeKey,
                enabled: dto.enabled,
            });
        }
        return this.repository.save(preference);
    }
    async isEnabled(userId, notificationTypeKey) {
        const preference = await this.repository.findOneBy({ userId, notificationTypeKey });
        if (preference) {
            return preference.enabled;
        }
        const notifType = await this.notifTypeRepository.findOneBy({ key: notificationTypeKey });
        return notifType?.defaultEnabled ?? true;
    }
};
exports.NotificationPreferencesService = NotificationPreferencesService;
exports.NotificationPreferencesService = NotificationPreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_notification_preference_entity_1.UserNotificationPreference)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_type_entity_1.NotificationType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationPreferencesService);
//# sourceMappingURL=notification-preferences.service.js.map