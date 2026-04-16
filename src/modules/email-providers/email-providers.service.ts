import { Injectable, HttpStatus, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EmailProvider,
  EmailProviderConfigUnion,
} from '../../database/entities/email-provider.entity';
import { AuditService } from '../audit/audit.service';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateEmailProviderDto } from './dto/create-email-provider.dto';
import { UpdateEmailProviderDto } from './dto/update-email-provider.dto';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';

@Injectable()
export class EmailProvidersService implements OnModuleInit {
  constructor(
    @InjectRepository(EmailProvider)
    private readonly repository: Repository<EmailProvider>,
    private readonly auditService: AuditService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.permissionsService.registerPermissions([
      {
        name: 'email-providers.read',
        description: 'Ver providers de email',
        module: 'email-providers',
        moduleName: 'Email Providers',
      },
      {
        name: 'email-providers.create',
        description: 'Crear providers de email',
        module: 'email-providers',
        moduleName: 'Email Providers',
      },
      {
        name: 'email-providers.update',
        description: 'Modificar providers de email',
        module: 'email-providers',
        moduleName: 'Email Providers',
      },
      {
        name: 'email-providers.delete',
        description: 'Eliminar providers de email',
        module: 'email-providers',
        moduleName: 'Email Providers',
      },
    ]);
  }

  findAll(): Promise<EmailProvider[]> {
    return this.repository.find({ order: { isActive: 'DESC', createdAt: 'ASC' } });
  }

  async findOne(id: number): Promise<EmailProvider> {
    const provider = await this.repository.findOneBy({ id });
    if (!provider) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        `Provider ${id} no encontrado`,
      );
    }
    return provider;
  }

  async findActive(): Promise<EmailProvider | null> {
    return this.repository.findOneBy({ isActive: true });
  }

  async create(dto: CreateEmailProviderDto): Promise<EmailProvider> {
    const config = this.extractConfig(dto);
    const provider = this.repository.create({
      name: dto.name,
      provider: dto.provider,
      from: dto.from,
      config,
      isActive: false,
    });
    const saved = await this.repository.save(provider);

    await this.auditService.log({
      action: 'create',
      entity: 'EmailProvider',
      entityId: String(saved.id),
      metadata: { after: { name: saved.name, provider: saved.provider } },
    });

    return saved;
  }

  async update(id: number, dto: UpdateEmailProviderDto): Promise<EmailProvider> {
    const provider = await this.findOne(id);

    if (dto.provider && dto.provider !== provider.provider) {
      // Si cambia el tipo, el config anterior ya no es válido
      provider.config = this.extractConfig(dto as CreateEmailProviderDto);
      provider.provider = dto.provider;
    } else if (dto.smtp || dto.resend || dto.googleOAuth) {
      provider.config = this.extractConfig({
        ...dto,
        provider: provider.provider,
      } as CreateEmailProviderDto);
    }

    if (dto.name !== undefined) provider.name = dto.name;
    if (dto.from !== undefined) provider.from = dto.from;

    const saved = await this.repository.save(provider);

    await this.auditService.log({
      action: 'update',
      entity: 'EmailProvider',
      entityId: String(saved.id),
      metadata: { after: { name: saved.name, provider: saved.provider } },
    });

    return saved;
  }

  /**
   * Activa un provider y desactiva todos los demás.
   * Solo puede haber un provider activo a la vez.
   */
  async activate(id: number): Promise<EmailProvider> {
    const provider = await this.findOne(id);

    // Desactivar todos
    await this.repository
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .where('isActive = true')
      .execute();

    // Activar el elegido
    provider.isActive = true;
    const saved = await this.repository.save(provider);

    await this.auditService.log({
      action: 'activate',
      entity: 'EmailProvider',
      entityId: String(id),
      metadata: { after: { name: saved.name, provider: saved.provider, isActive: true } },
    });

    return saved;
  }

  async remove(id: number): Promise<void> {
    const provider = await this.findOne(id);

    if (provider.isActive) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        ErrorCode.CONFLICT,
        'No podés eliminar el provider activo. Activá otro primero.',
      );
    }

    await this.auditService.log({
      action: 'delete',
      entity: 'EmailProvider',
      entityId: String(id),
      metadata: { before: { name: provider.name, provider: provider.provider } },
    });

    await this.repository.remove(provider);
  }

  private extractConfig(dto: CreateEmailProviderDto): EmailProviderConfigUnion {
    switch (dto.provider) {
      case 'smtp':
        if (!dto.smtp) {
          throw new ApiException(
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
            'Falta configuración SMTP',
          );
        }
        return dto.smtp;
      case 'resend':
        if (!dto.resend) {
          throw new ApiException(
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
            'Falta configuración Resend',
          );
        }
        return dto.resend;
      case 'google-oauth':
        if (!dto.googleOAuth) {
          throw new ApiException(
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
            'Falta configuración Google OAuth',
          );
        }
        return dto.googleOAuth;
    }
  }
}
