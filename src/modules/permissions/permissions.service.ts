import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../database/entities/permission.entity';

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

  findAll(module?: string): Promise<Permission[]> {
    if (module) {
      return this.permissionRepository.find({ where: { module } });
    }
    return this.permissionRepository.find({ order: { module: 'ASC', name: 'ASC' } });
  }

  findOne(id: string): Promise<Permission | null> {
    return this.permissionRepository.findOneBy({ id });
  }

  findByIds(ids: string[]): Promise<Permission[]> {
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
        await this.permissionRepository.save(
          this.permissionRepository.create(def),
        );
      }
    }
  }
}
