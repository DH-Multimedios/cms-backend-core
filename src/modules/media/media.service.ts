import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../../database/entities/media.entity';
import { SettingsService } from '../settings/settings.service';
import { AuditService } from '../audit/audit.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { ListMediaDto, UpdateMediaDto } from './dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

@Injectable()
export class MediaService {
  private readonly uploadPath = process.env.UPLOADS_PATH || 'uploads/media';
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly settingsService: SettingsService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Valida la imagen contra las configuraciones de settings
   */
  private async validateImage(file: Express.Multer.File): Promise<void> {
    // Obtener configuraciones desde settings
    const allowedMimetypesStr = await this.settingsService.getValue('media.allowedMimetypes');
    const maxFileSizeStr = await this.settingsService.getValue('media.maxFileSize');

    if (!allowedMimetypesStr || !maxFileSizeStr) {
      throw new ApiException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_ERROR,
        'Configuración de media no encontrada. Verifica que existan los settings media.allowedMimetypes y media.maxFileSize',
      );
    }

    const allowedMimetypes: string[] = JSON.parse(allowedMimetypesStr);
    const maxFileSize: number = parseInt(maxFileSizeStr, 10);

    // Validar mimetype
    if (!allowedMimetypes.includes(file.mimetype)) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        `Tipo de imagen no permitido. Tipos permitidos: ${allowedMimetypes.join(', ')}`,
      );
    }

    // Validar tamaño
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        `La imagen excede el tamaño máximo permitido (${maxSizeMB}MB)`,
      );
    }
  }

  /**
   * Genera el path de almacenamiento
   */
  private generateStoragePath(uploadedByUserId: string, usage: string): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(uploadedByUserId, usage, date);
  }

  /**
   * Extrae dimensiones de la imagen usando Sharp
   */
  private async extractImageMetadata(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        'No se pudo procesar la imagen. Asegúrate de que sea una imagen válida.',
      );
    }
  }

  /**
   * Guarda la imagen físicamente en el filesystem
   */
  private async saveImageToDisk(file: Express.Multer.File, storagePath: string): Promise<string> {
    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;
    const fullPath = path.join(this.uploadPath, storagePath);
    const filePath = path.join(fullPath, filename);

    // Crear directorios si no existen
    await fs.mkdir(fullPath, { recursive: true });

    // Escribir archivo
    await fs.writeFile(filePath, file.buffer);

    return path.join(storagePath, filename);
  }

  /**
   * Genera la URL pública de la imagen
   */
  private generatePublicUrl(relativePath: string): string {
    return `${this.baseUrl}/uploads/media/${relativePath}`;
  }

  /**
   * Sube una imagen
   */
  async upload(
    file: Express.Multer.File,
    uploadedByUserId: string,
    options: {
      alt: string;
      usage?: string;
    },
  ): Promise<Media> {
    // Validar imagen
    await this.validateImage(file);

    // Extraer dimensiones con Sharp
    const { width, height } = await this.extractImageMetadata(file.buffer);

    // Generar path y guardar en disco
    const usage = options.usage || 'general';
    const storagePath = this.generateStoragePath(uploadedByUserId, usage);
    const relativePath = await this.saveImageToDisk(file, storagePath);

    // Generar URL pública
    const url = this.generatePublicUrl(relativePath);

    // Crear registro en DB
    const mediaEntity = this.mediaRepository.create({
      filename: path.basename(relativePath),
      originalName: file.originalname,
      alt: options.alt,
      mimetype: file.mimetype,
      size: file.size,
      width,
      height,
      path: relativePath,
      url,
      uploadedByUserId,
      usage,
    });

    const saved = await this.mediaRepository.save(mediaEntity);

    // Auditar
    await this.auditService.log({
      userId: uploadedByUserId,
      action: 'upload',
      entity: 'Media',
      entityId: saved.id,
      metadata: {
        filename: saved.originalName,
        alt: saved.alt,
        size: saved.size,
        mimetype: saved.mimetype,
        width: saved.width,
        height: saved.height,
        usage: saved.usage,
      },
    });

    return saved;
  }

  /**
   * Lista imágenes con filtros
   */
  async findAll(
    filters: ListMediaDto,
    userId?: string,
    hasListPermission = false,
  ): Promise<Media[]> {
    const qb = this.mediaRepository.createQueryBuilder('media');

    // Si el usuario NO tiene permiso list, solo ve sus imágenes
    if (!hasListPermission && userId) {
      qb.where('media.uploadedByUserId = :userId', { userId });
    }

    // Filtros opcionales
    if (filters.usage) {
      qb.andWhere('media.usage = :usage', { usage: filters.usage });
    }

    if (filters.uploadedByUserId) {
      qb.andWhere('media.uploadedByUserId = :uploadedByUserId', {
        uploadedByUserId: filters.uploadedByUserId,
      });
    }

    if (filters.search) {
      qb.andWhere('(media.alt ILIKE :search OR media.originalName ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    qb.orderBy('media.createdAt', 'DESC');

    return await qb.getMany();
  }

  /**
   * Obtiene una imagen por ID
   */
  async findOne(id: string, userId?: string, hasReadPermission = false): Promise<Media> {
    const qb = this.mediaRepository.createQueryBuilder('media').where('media.id = :id', { id });

    // Si el usuario NO tiene permiso read, solo ve sus imágenes
    if (!hasReadPermission && userId) {
      qb.andWhere('media.uploadedByUserId = :userId', { userId });
    }

    const media = await qb.getOne();

    if (!media) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.RESOURCE_NOT_FOUND,
        'Imagen no encontrada',
      );
    }

    return media;
  }

  /**
   * Actualiza el alt text de una imagen
   */
  async update(
    id: string,
    updateDto: UpdateMediaDto,
    userId: string,
    hasEditPermission = false,
  ): Promise<Media> {
    // Buscar la imagen
    const media = await this.findOne(id, userId, hasEditPermission);

    // Actualizar solo el alt
    media.alt = updateDto.alt;
    media.updatedAt = new Date();

    const updated = await this.mediaRepository.save(media);

    // Auditar
    await this.auditService.log({
      userId,
      action: 'edit',
      entity: 'Media',
      entityId: updated.id,
      metadata: {
        oldAlt: media.alt,
        newAlt: updateDto.alt,
      },
    });

    return updated;
  }

  /**
   * Elimina una imagen (física y del DB)
   */
  async remove(id: string, userId: string, hasDeletePermission = false): Promise<void> {
    // Buscar la imagen
    const media = await this.findOne(id, userId, hasDeletePermission);

    // Eliminar archivo físico
    const fullPath = path.join(this.uploadPath, media.path);
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }

    // Eliminar registro de DB
    await this.mediaRepository.remove(media);

    // Auditar
    await this.auditService.log({
      userId,
      action: 'delete',
      entity: 'Media',
      entityId: id,
      metadata: {
        filename: media.originalName,
        alt: media.alt,
        path: media.path,
      },
    });
  }
}
