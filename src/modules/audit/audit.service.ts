import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuditLogListItemDto, AuditLogDetailDto } from './dto/audit-log-response.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';

export interface AuditLogOptions {
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any> | null;
  /** Override userId from CLS context (e.g. for login failures where no session exists) */
  userId?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly cls: ClsService,
  ) {}

  async log(options: AuditLogOptions): Promise<void> {
    const userId = options.userId !== undefined
      ? options.userId
      : (this.cls.get<string | undefined>('userId') ?? null);

    const ip = this.cls.get<string | undefined>('ip') ?? null;
    const userAgent = this.cls.get<string | undefined>('userAgent') ?? null;

    const log = new AuditLog();
    log.userId = userId;
    log.action = options.action;
    log.entity = options.entity;
    log.entityId = options.entityId ?? null;
    log.metadata = options.metadata ?? null;
    log.ip = ip;
    log.userAgent = userAgent;

    await this.auditLogRepository.save(log);
  }

  async findAll(query: AuditQueryDto): Promise<PaginatedResult<AuditLogListItemDto>> {
    const { page = 1, limit = 20, sortOrder = 'DESC', sortBy = 'createdAt', userId, entity, action, from, to } = query;

    const qb = this.auditLogRepository.createQueryBuilder('log')
      .leftJoin('log.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName'])
      .where('(user.isSystemUser = false OR log.userId IS NULL)');

    if (userId) {
      qb.andWhere('log.userId = :userId', { userId });
    }
    if (entity) {
      qb.andWhere('log.entity = :entity', { entity });
    }
    if (action) {
      qb.andWhere('log.action = :action', { action });
    }
    if (from) {
      qb.andWhere('log.createdAt >= :from', { from: new Date(from) });
    }
    if (to) {
      qb.andWhere('log.createdAt <= :to', { to: new Date(to) });
    }

    qb.orderBy(`log.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [logs, total] = await qb.getManyAndCount();

    return {
      items: logs.map(AuditLogListItemDto.from),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AuditLogDetailDto> {
    const log = await this.auditLogRepository.createQueryBuilder('log')
      .leftJoin('log.user', 'user')
      .addSelect(['user.id', 'user.firstName', 'user.lastName'])
      .where('log.id = :id', { id })
      .getOne();

    if (!log) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Audit log ${id} no encontrado`);
    }

    return AuditLogDetailDto.from(log);
  }
}
