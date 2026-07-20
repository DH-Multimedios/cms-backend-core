import { Injectable, HttpStatus, OnModuleInit, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting, SettingInputType, SettingType } from '../../database/entities/setting.entity';
import { SettingCategory } from '../../database/entities/setting-category.entity';
import { Media } from '../../database/entities/media.entity';
import { AuditService } from '../audit/audit.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { SettingsQueryDto } from './dto/settings-query.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(SettingCategory)
    private readonly categoryRepository: Repository<SettingCategory>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly auditService: AuditService,
    private readonly permissionsService: PermissionsService,
  ) {}

  // ─── Input type schemas ───────────────────────────────────────────────────

  getInputTypeSchemas(): InputTypeSchema[] {
    return INPUT_TYPE_SCHEMAS;
  }

  async onModuleInit(): Promise<void> {
    await this.permissionsService.registerPermissions([
      {
        name: 'settings.create',
        description: 'Crear settings',
        module: 'settings',
        moduleName: 'Configuración',
      },
      {
        name: 'settings.update',
        description: 'Modificar settings y categorías',
        module: 'settings',
        moduleName: 'Configuración',
      },
      {
        name: 'settings.delete',
        description: 'Eliminar settings y categorías',
        module: 'settings',
        moduleName: 'Configuración',
      },
    ]);
  }

  // ─── Categorías ───────────────────────────────────────────────────────────

  async findAllCategories(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResult<SettingCategory & { settingsCount: number }>> {
    const qb = this.categoryRepository
      .createQueryBuilder('category')
      .addSelect(
        (subquery) =>
          subquery
            .select('COUNT(*)')
            .from(Setting, 'countedSetting')
            .where('countedSetting.categoryId = category.id'),
        'category_settingsCount',
      )
      .orderBy('category.order', 'ASC')
      .addOrderBy('category.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [{ entities, raw }, total] = await Promise.all([
      qb.getRawAndEntities(),
      qb.clone().getCount(),
    ]);
    const items = entities.map((category, index) =>
      Object.assign(category, { settingsCount: Number(raw[index].category_settingsCount) }),
    );

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findCategoryBySlug(
    slug: string,
    page = 1,
    limit = 20,
  ): Promise<
    SettingCategory & {
      settings: Setting[];
      settingsTotal: number;
      settingsPage: number;
      settingsLimit: number;
      settingsPages: number;
    }
  > {
    const category = await this.categoryRepository.findOneBy({ slug });
    if (!category) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        `Categoría '${slug}' no encontrada`,
      );
    }

    const [settings, settingsTotal] = await this.settingRepository.findAndCount({
      where: { categoryId: category.id },
      order: { order: 'ASC', key: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    await Promise.all(settings.map((s) => this.injectImageMeta(s)));

    return Object.assign(category, {
      settings,
      settingsTotal,
      settingsPage: page,
      settingsLimit: limit,
      settingsPages: Math.ceil(settingsTotal / limit),
    });
  }

  async createCategory(dto: CreateCategoryDto): Promise<SettingCategory> {
    const slug = dto.slug ?? generateSlug(dto.label);

    const existing = await this.categoryRepository.findOneBy({ slug });
    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT,
        `Ya existe una categoría con el slug '${slug}'`,
      );
    }

    const category = this.categoryRepository.create({ ...dto, slug });
    const saved = await this.categoryRepository.save(category);

    await this.auditService.log({
      action: 'create',
      entity: 'SettingCategory',
      entityId: String(saved.id),
      metadata: { after: { slug: saved.slug, label: saved.label } },
    });

    return saved;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<SettingCategory> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        `Categoría ${id} no encontrada`,
      );
    }

    // Resolver slug: explícito > auto desde label > mantener el actual
    if (dto.slug) {
      if (dto.slug !== category.slug) {
        const existing = await this.categoryRepository.findOneBy({ slug: dto.slug });
        if (existing) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            ErrorCode.CONFLICT,
            `Ya existe una categoría con el slug '${dto.slug}'`,
          );
        }
      }
    } else if (dto.label && dto.label !== category.label) {
      dto.slug = generateSlug(dto.label);
      if (dto.slug !== category.slug) {
        const existing = await this.categoryRepository.findOneBy({ slug: dto.slug });
        if (existing) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            ErrorCode.CONFLICT,
            `El slug generado '${dto.slug}' ya existe. Enviá un slug explícito.`,
          );
        }
      }
    }

    const before = { slug: category.slug, label: category.label };
    Object.assign(category, dto);
    const saved = await this.categoryRepository.save(category);

    await this.auditService.log({
      action: 'update',
      entity: 'SettingCategory',
      entityId: String(saved.id),
      metadata: { before, after: { slug: saved.slug, label: saved.label } },
    });

    return saved;
  }

  async reorderCategories(dto: ReorderCategoriesDto): Promise<{ message: string }> {
    await Promise.all(
      dto.ids.map((id, index) => this.categoryRepository.update(id, { order: index })),
    );
    return { message: 'Orden actualizado correctamente' };
  }

  async removeCategory(id: number): Promise<{ message: string }> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { settings: true },
    });
    if (!category) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        `Categoría ${id} no encontrada`,
      );
    }
    if (category.isProtected) {
      throw new ForbiddenException('Esta categoría está protegida y no puede eliminarse');
    }
    if (category.settings?.length) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT,
        `La categoría tiene ${category.settings.length} setting(s) asociados. Reasignalos o eliminalos primero.`,
      );
    }

    await this.auditService.log({
      action: 'delete',
      entity: 'SettingCategory',
      entityId: String(id),
      metadata: { before: { slug: category.slug, label: category.label } },
    });

    await this.categoryRepository.remove(category);

    return { message: `Categoría '${category.label}' eliminada correctamente` };
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  async findAll(query: SettingsQueryDto): Promise<Setting[]> {
    const qb = this.settingRepository
      .createQueryBuilder('setting')
      .leftJoinAndSelect('setting.category', 'category');

    if (query.categoryId) {
      qb.andWhere('setting.categoryId = :categoryId', { categoryId: query.categoryId });
    } else if (query.category) {
      qb.andWhere('category.slug = :slug', { slug: query.category });
    }

    qb.orderBy('category.order', 'ASC')
      .addOrderBy('setting.order', 'ASC')
      .addOrderBy('setting.key', 'ASC');

    const settings = await qb.getMany();
    await Promise.all(settings.map((s) => this.injectImageMeta(s)));
    return settings;
  }

  async findByKey(key: string): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { key },
      relations: { category: true },
    });
    if (!setting) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        `Setting '${key}' no encontrado`,
      );
    }
    await this.injectImageMeta(setting);
    return setting;
  }

  async getValue(key: string, defaultValue?: string): Promise<string | undefined> {
    const setting = await this.settingRepository.findOneBy({ key });
    return setting?.value ?? defaultValue;
  }

  async create(dto: CreateSettingDto): Promise<Setting> {
    const existing = await this.settingRepository.findOneBy({ key: dto.key });
    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT,
        `Ya existe un setting con el key '${dto.key}'`,
      );
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
      if (!category) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          `Categoría ${dto.categoryId} no encontrada`,
        );
      }
    }

    const setting = this.settingRepository.create(dto);
    const saved = await this.settingRepository.save(setting);

    await this.auditService.log({
      action: 'create',
      entity: 'Setting',
      entityId: saved.id,
      metadata: {
        after: { key: saved.key, value: saved.type === 'password' ? '***' : saved.value },
      },
    });

    return saved;
  }

  async update(id: string, dto: UpdateSettingDto): Promise<Setting> {
    const setting = await this.settingRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!setting) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        `Setting ${id} no encontrado`,
      );
    }

    if (dto.key && dto.key !== setting.key) {
      const existing = await this.settingRepository.findOneBy({ key: dto.key });
      if (existing) {
        throw new ApiException(
          HttpStatus.CONFLICT,
          ErrorCode.CONFLICT,
          `Ya existe un setting con el key '${dto.key}'`,
        );
      }
    }

    if (dto.categoryId && dto.categoryId !== setting.categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
      if (!category) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          ErrorCode.NOT_FOUND,
          `Categoría ${dto.categoryId} no encontrada`,
        );
      }
    }

    const effectiveInputType = dto.inputType ?? setting.inputType;
    if (dto.value !== undefined) {
      this.validateValue(dto.value, effectiveInputType);
    }

    const isSensitive = setting.type === 'password' || dto.type === 'password';
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

  async remove(id: string): Promise<{ message: string }> {
    const setting = await this.settingRepository.findOneBy({ id });
    if (!setting) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        `Setting ${id} no encontrado`,
      );
    }
    if (setting.isProtected) {
      throw new ForbiddenException('Esta configuración está protegida y no puede eliminarse');
    }

    await this.auditService.log({
      action: 'delete',
      entity: 'Setting',
      entityId: id,
      metadata: { before: { key: setting.key } },
    });

    await this.settingRepository.remove(setting);

    return { message: `Setting '${setting.key}' eliminado correctamente` };
  }

  // ─── Value validator ─────────────────────────────────────────────────────

  /**
   * Valida el valor según el inputType del setting.
   * Solo aplica a tipos con formato estricto (url, email).
   */
  private validateValue(value: string, inputType: SettingInputType): void {
    if (inputType === 'url' && value !== '') {
      try {
        new URL(value);
      } catch {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          `El valor no es una URL válida`,
        );
      }
    }

    if (inputType === 'email' && value !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new ApiException(
          HttpStatus.BAD_REQUEST,
          ErrorCode.VALIDATION_ERROR,
          `El valor no es un email válido`,
        );
      }
    }
  }

  // ─── Image meta resolver ──────────────────────────────────────────────────

  /**
   * Busca el media por UUID y retorna { url, alt }.
   * Si el UUID es inválido o el media fue borrado, retorna null (graceful degradation).
   */
  private async resolveImageMeta(mediaId: string): Promise<{ url: string; alt: string } | null> {
    if (!mediaId) return null;
    try {
      const media = await this.mediaRepository.findOneBy({ id: mediaId });
      if (!media) return null;
      return { url: media.url, alt: media.alt };
    } catch {
      return null;
    }
  }

  /**
   * Inyecta url y alt en meta para settings de tipo imagen.
   * Muta el objeto setting en memoria — no persiste nada en DB.
   */
  private async injectImageMeta(setting: Setting): Promise<void> {
    if (setting.inputType !== 'image' || !setting.value) return;
    const resolved = await this.resolveImageMeta(setting.value);
    if (!resolved) return;
    setting.meta = { ...(setting.meta ?? {}), ...resolved };
  }
}

// ─── Input type schema definitions ────────────────────────────────────────────

export interface MetaFieldSchema {
  type: 'string' | 'number' | 'array';
  required: boolean;
  description: string;
  itemSchema?: Record<string, string>;
}

export interface InputTypeSchema {
  value: SettingInputType;
  label: string;
  compatibleTypes: SettingType[];
  meta: Record<string, MetaFieldSchema> | null;
}

const INPUT_TYPE_SCHEMAS: InputTypeSchema[] = [
  {
    value: 'text',
    label: 'Texto corto',
    compatibleTypes: ['string'],
    meta: null,
  },
  {
    value: 'textarea',
    label: 'Texto largo',
    compatibleTypes: ['string'],
    meta: {
      rows: { type: 'number', required: false, description: 'Número de filas visibles' },
    },
  },
  {
    value: 'number',
    label: 'Número',
    compatibleTypes: ['number'],
    meta: {
      min: { type: 'number', required: false, description: 'Valor mínimo permitido' },
      max: { type: 'number', required: false, description: 'Valor máximo permitido' },
    },
  },
  {
    value: 'password',
    label: 'Contraseña',
    compatibleTypes: ['string', 'password'],
    meta: null,
  },
  {
    value: 'toggle',
    label: 'Toggle',
    compatibleTypes: ['boolean'],
    meta: null,
  },
  {
    value: 'checkbox',
    label: 'Checkbox',
    compatibleTypes: ['boolean', 'json'],
    meta: {
      options: {
        type: 'array',
        required: false,
        description: 'Opciones disponibles (solo si type es json para selección múltiple)',
        itemSchema: { value: 'string', label: 'string' },
      },
    },
  },
  {
    value: 'radio',
    label: 'Radio',
    compatibleTypes: ['string'],
    meta: {
      options: {
        type: 'array',
        required: true,
        description: 'Opciones disponibles',
        itemSchema: { value: 'string', label: 'string' },
      },
    },
  },
  {
    value: 'select',
    label: 'Select',
    compatibleTypes: ['string'],
    meta: {
      options: {
        type: 'array',
        required: true,
        description: 'Opciones disponibles',
        itemSchema: { value: 'string', label: 'string' },
      },
    },
  },
  {
    value: 'color',
    label: 'Color',
    compatibleTypes: ['string'],
    meta: null,
  },
  {
    value: 'url',
    label: 'URL',
    compatibleTypes: ['string'],
    meta: null,
  },
  {
    value: 'email',
    label: 'Email',
    compatibleTypes: ['string'],
    meta: null,
  },
  {
    value: 'date',
    label: 'Fecha',
    compatibleTypes: ['string'],
    meta: null,
  },
  {
    value: 'image',
    label: 'Imagen',
    compatibleTypes: ['string'],
    meta: null,
  },
];
