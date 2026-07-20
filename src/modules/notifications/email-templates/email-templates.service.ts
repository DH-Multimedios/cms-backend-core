import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../../../database/entities/email-template.entity';
import { EmailLayout } from '../../../database/entities/email-layout.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { ListEmailTemplatesDto } from './dto/list-email-templates.dto';
import { TemplateRendererService } from '../template-renderer.service';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/enums/error-codes.enum';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly repository: Repository<EmailTemplate>,
    @InjectRepository(EmailLayout)
    private readonly layoutRepository: Repository<EmailLayout>,
    private readonly renderer: TemplateRendererService,
  ) {}

  async findAll(query: ListEmailTemplatesDto = {}): Promise<PaginatedResult<EmailTemplate>> {
    const { page = 1, limit = 20, sortOrder = 'ASC', sortBy = 'entityType', entityType } = query;

    const qb = this.repository.createQueryBuilder('template');

    if (entityType) {
      qb.where('template.entityType = :entityType', { entityType });
    }

    qb.orderBy(`template.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: number): Promise<EmailTemplate> {
    const template = await this.repository.findOne({
      where: { id },
      relations: { header: true, footer: true },
    });
    if (!template) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        `Template ${id} no encontrado`,
      );
    }
    return template;
  }

  async findByType(entityType: string, notificationType: string): Promise<EmailTemplate | null> {
    return this.repository.findOne({
      where: { entityType, notificationType },
      relations: { header: true, footer: true },
    });
  }

  async create(dto: CreateEmailTemplateDto): Promise<EmailTemplate> {
    const existing = await this.repository.findOneBy({
      entityType: dto.entityType,
      notificationType: dto.notificationType,
    });
    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT,
        `Ya existe un template para '${dto.entityType}.${dto.notificationType}'`,
      );
    }

    const template = this.repository.create({ ...dto, variables: dto.variables ?? [] });
    const saved = await this.repository.save(template);

    return this.compileAndSave(saved);
  }

  async update(id: number, dto: UpdateEmailTemplateDto): Promise<EmailTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    const saved = await this.repository.save(template);
    return this.compileAndSave(saved);
  }

  async remove(id: number): Promise<{ message: string }> {
    const template = await this.findOne(id);
    if (template.isDefault) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT,
        'No podés eliminar un template por defecto del core.',
      );
    }
    await this.repository.remove(template);
    return { message: `Template '${template.name}' eliminado correctamente` };
  }

  /**
   * Recompila el HTML del template y lo persiste.
   * Llamar después de crear/actualizar un template o sus layouts.
   */
  async compileAndSave(template: EmailTemplate): Promise<EmailTemplate> {
    const full = await this.repository.findOne({
      where: { id: template.id },
      relations: { header: true, footer: true },
    });

    const headerSections = full?.header?.sections ?? [];
    const footerSections = full?.footer?.sections ?? [];

    full!.compiledHtml = this.renderer.compile(headerSections, full!.bodySections, footerSections);

    return this.repository.save(full!);
  }
}
