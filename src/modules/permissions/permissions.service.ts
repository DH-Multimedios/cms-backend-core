import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../database/entities/permission.entity';
import { PermissionsQueryDto } from './dto/permissions-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

export interface PermissionDefinition {
  name: string;
  description?: string;
  module: string;
}

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findList() {
    return this.permissionRepository
      .createQueryBuilder('permission')
      .select([
        'permission.id',
        'permission.name',
        'permission.description',
        'permission.module',
        'permission.moduleName',
      ])
      .orderBy('permission.module', 'ASC')
      .addOrderBy('permission.name', 'ASC')
      .getMany();
  }

  async findAll(query: PermissionsQueryDto): Promise<PaginatedResult<Permission>> {
    const {
      page = 1,
      limit = 20,
      sortOrder = 'DESC',
      sortBy = 'createdAt',
      search,
      module,
    } = query;

    const qb = this.permissionRepository.createQueryBuilder('permission');

    if (search) {
      qb.andWhere('permission.name ILIKE :search', { search: `%${search}%` });
    }

    if (module) {
      qb.andWhere('permission.module = :module', { module });
    }

    qb.orderBy(`permission.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  findOne(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOneBy({ id });
  }

  findByIds(ids: string[]): Promise<Permission[]> {
    if (!ids.length) return Promise.resolve([]);
    return this.permissionRepository
      .createQueryBuilder('permission')
      .where('permission.id IN (:...ids)', { ids })
      .getMany();
  }

  /**
   * Registra permisos de un módulo de negocio.
   * Si el permiso ya existe (por name), lo ignora.
   * Los módulos de negocio llaman esto en OnModuleInit.
   */
  async registerPermissions(permissions: PermissionDefinition[]): Promise<void> {
    for (const def of permissions) {
      const exists = await this.permissionRepository.findOneBy({ name: def.name });
      if (!exists) {
        await this.permissionRepository.save(this.permissionRepository.create(def));
      }
    }
  }
}
