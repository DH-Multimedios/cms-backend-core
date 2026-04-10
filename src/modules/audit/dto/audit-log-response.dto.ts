import { AuditLog } from '../../../database/entities/audit-log.entity';

export class AuditUserDto {
  id: string;
  firstName: string;
  lastName: string;

  static from(user: AuditLog['user']): AuditUserDto | null {
    if (!user) return null;
    return { id: user.id, firstName: user.firstName, lastName: user.lastName };
  }
}

export class AuditLogListItemDto {
  id: string;
  userId: string | null;
  user: AuditUserDto | null;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: Date;

  static from(log: AuditLog): AuditLogListItemDto {
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

export class AuditLogDetailDto extends AuditLogListItemDto {
  metadata: Record<string, any> | null;

  static from(log: AuditLog): AuditLogDetailDto {
    return {
      ...AuditLogListItemDto.from(log),
      metadata: log.metadata,
    };
  }
}
