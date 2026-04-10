import { Injectable, HttpStatus, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '../../database/entities/setting.entity';
import { SettingCategory } from '../../database/entities/setting-category.entity';
import { AuditService } from '../audit/audit.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SettingsQueryDto } from './dto/settings-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(SettingCategory)
    private readonly categoryRepository: Repository<SettingCategory>,
    private readonly auditService: AuditService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.permissionsService.registerPermissions([
      { name: 'settings.create', description: 'Crear settings', module: 'settings' },
      { name: 'settings.update', description: 'Modificar settings y categorías', module: 'settings' },
      { name: 'settings.delete', description: 'Eliminar settings y categorías', module: 'settings' },
    ]);
  }

  // ─── Categorías ───────────────────────────────────────────────────────────

  findAllCategories(): Promise<SettingCategory[]> {
    return this.categoryRepository.find({
      order: { order: 'ASC', label: 'ASC' },
      relations: ['settings'],
    });
  }

  async findCategoryByKey(key: string): Promise<SettingCategory> {
    const category = await this.categoryRepository.findOne({
      where: { key },
      relations: ['settings'],
      order: { settings: { order: 'ASC' } },
    });
    if (!category) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Categoría '${key}' no encontrada`);
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<SettingCategory> {
    const existing = await this.categoryRepository.findOneBy({ key: dto.key });
    if (existing) {
      throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, `Ya existe una categoría con el key '${dto.key}'`);
    }
    const category = this.categoryRepository.create(dto);
    const saved = await this.categoryRepository.save(category);

    await this.auditService.log({
      action: 'create',
      entity: 'SettingCategory',
      entityId: String(saved.id),
      metadata: { after: { key: saved.key, label: saved.label } },
    });

    return saved;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<SettingCategory> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Categoría ${id} no encontrada`);
    }

    if (dto.key && dto.key !== category.key) {
      const existing = await this.categoryRepository.findOneBy({ key: dto.key });
      if (existing) {
        throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, `Ya existe una categoría con el key '${dto.key}'`);
      }
    }

    const before = { key: category.key, label: category.label };
    Object.assign(category, dto);
    const saved = await this.categoryRepository.save(category);

    await this.auditService.log({
      action: 'update',
      entity: 'SettingCategory',
      entityId: String(saved.id),
      metadata: { before, after: { key: saved.key, label: saved.label } },
    });

    return saved;
  }

  async removeCategory(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['settings'],
    });
    if (!category) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Categoría ${id} no encontrada`);
    }
    if (category.settings?.length) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT,
        `La categoría tiene ${category.settings.length} setting(s) asociados. Reasignalos o eliminados primero.`,
      );
    }

    await this.auditService.log({
      action: 'delete',
      entity: 'SettingCategory',
      entityId: String(id),
      metadata: { before: { key: category.key, label: category.label } },
    });

    await this.categoryRepository.remove(category);
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  async findAll(query: SettingsQueryDto): Promise<Setting[]> {
    const qb = this.settingRepository
      .createQueryBuilder('setting')
      .leftJoinAndSelect('setting.category', 'category');

    if (query.categoryId) {
      qb.andWhere('setting.categoryId = :categoryId', { categoryId: query.categoryId });
    } else if (query.category) {
      qb.andWhere('category.key = :key', { key: query.category });
    }

    qb.orderBy('category.order', 'ASC')
      .addOrderBy('setting.order', 'ASC')
      .addOrderBy('setting.key', 'ASC');

    return qb.getMany();
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { key },
      relations: ['category'],
    });
    if (!setting) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Setting '${key}' no encontrado`);
    }
    return setting;
  }

  /**
   * Helper para otros servicios — retorna el valor crudo o un default.
   */
  async getValue(key: string, defaultValue?: string): Promise<string | undefined> {
    const setting = await this.settingRepository.findOneBy({ key });
    return setting?.value ?? defaultValue;
  }

  async create(dto: CreateSettingDto): Promise<Setting> {
    const existing = await this.settingRepository.findOneBy({ key: dto.key });
    if (existing) {
      throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, `Ya existe un setting con el key '${dto.key}'`);
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
      if (!category) {
        throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Categoría ${dto.categoryId} no encontrada`);
      }
    }

    const setting = this.settingRepository.create(dto);
    const saved = await this.settingRepository.save(setting);

    await this.auditService.log({
      action: 'create',
      entity: 'Setting',
      entityId: saved.id,
      metadata: { after: { key: saved.key, value: saved.type === 'password' ? '***' : saved.value } },
    });

    return saved;
  }

  async update(id: string, dto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!setting) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Setting ${id} no encontrado`);
    }

    if (dto.key && dto.key !== setting.key) {
      const existing = await this.settingRepository.findOneBy({ key: dto.key });
      if (existing) {
        throw new ApiException(HttpStatus.CONFLICT, ErrorCode.CONFLICT, `Ya existe un setting con el key '${dto.key}'`);
      }
    }

    if (dto.categoryId && dto.categoryId !== setting.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
      if (!category) {
        throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Categoría ${dto.categoryId} no encontrada`);
      }
    }

    const isSensitive = (setting.type === 'password' || dto.type === 'password');
    const before = { key: setting.key, value: isSensitive ? '***' : setting.value };

    Object.assign(setting, dto);
    const saved = await this.settingRepository.save(setting);

    await this.auditService.log({
      action: 'update',
      entity: 'Setting',
      entityId: saved.id,
      metadata: {
        before,
        after: { key: saved.key, value: isSensitive ? '***' : saved.value },
      },
    });

    return saved;
  }

  async remove(id: string): Promise<void> {
    const setting = await this.settingRepository.findOneBy({ id });
    if (!setting) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, `Setting ${id} no encontrado`);
    }

    await this.auditService.log({
      action: 'delete',
      entity: 'Setting',
      entityId: id,
      metadata: { before: { key: setting.key } },
    });

    await this.settingRepository.remove(setting);
  }
}
