"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogDetailDto = exports.AuditLogListItemDto = exports.AuditUserDto = void 0;
class AuditUserDto {
    id;
    firstName;
    lastName;
    static from(user) {
        if (!user)
            return null;
        return { id: user.id, firstName: user.firstName, lastName: user.lastName };
    }
}
exports.AuditUserDto = AuditUserDto;
class AuditLogListItemDto {
    id;
    userId;
    user;
    action;
    entity;
    entityId;
    ip;
    userAgent;
    createdAt;
    static from(log) {
        return {
            id: log.id,
            userId: log.userId,
            user: AuditUserDto.from(log.user),
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            ip: log.ip,
            userAgent: log.userAgent,
            createdAt: log.createdAt,
        };
    }
}
exports.AuditLogListItemDto = AuditLogListItemDto;
class AuditLogDetailDto extends AuditLogListItemDto {
    metadata;
    static from(log) {
        return {
            ...AuditLogListItemDto.from(log),
            metadata: log.metadata,
        };
    }
}
exports.AuditLogDetailDto = AuditLogDetailDto;
//# sourceMappingURL=audit-log-response.dto.js.map