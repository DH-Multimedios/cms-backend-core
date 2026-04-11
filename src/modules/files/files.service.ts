import { Injectable, HttpStatus, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../../database/entities/file.entity';
import { SettingsService } from '../settings/settings.service';
import { AuditService } from '../audit/audit.service';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { ListFilesDto, UpdateFileDto } from './dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  private readonly uploadPath = process.env.UPLOADS_PATH || 'uploads/files';

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly settingsService: SettingsService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Valida el archivo contra las configuraciones de settings
   */
  private async validateFile(file: Express.Multer.File): Promise<void> {
    // Obtener configuraciones desde settings
    const allowedMimetypesStr = await this.settingsService.getValue('files.allowedMimetypes');
    const maxFileSizeStr = await this.settingsService.getValue('files.maxFileSize');

    if (!allowedMimetypesStr || !maxFileSizeStr) {
      throw new ApiException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_ERROR,
        'Configuración de archivos no encontrada. Verifica que existan los settings files.allowedMimetypes y files.maxFileSize',
      );
    }

    const allowedMimetypes: string[] = JSON.parse(allowedMimetypesStr);
    const maxFileSize: number = parseInt(maxFileSizeStr, 10);

    // Validar mimetype
    if (!allowedMimetypes.includes(file.mimetype)) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        `Tipo de archivo no permitido. Tipos permitidos: ${allowedMimetypes.join(', ')}`,
      );
    }

    // Validar tamaño
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR,
        `El archivo excede el tamaño máximo permitido (${maxSizeMB}MB)`,
      );
    }
  }

  /**
   * Genera el path de almacenamiento según ownership
   */
  private generateStoragePath(fileOwnerUserId: string | null, usage: string): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const owner = fileOwnerUserId || 'system';
    return path.join(owner, usage, date);
  }

  /**
   * Guarda el archivo físicamente en el filesystem
   */
  private async saveFileToDisk(file: Express.Multer.File, storagePath: string): Promise<string> {
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
   * Sube un archivo
   */
  async upload(
    file: Express.Multer.File,
    uploadedByUserId: string,
    options: {
      fileOwnerUserId?: string;
      usage: string;
      name?: string;
      description?: string;
      isPublic?: boolean;
    },
  ): Promise<File> {
    // Validar archivo
    await this.validateFile(file);

    // Generar path y guardar en disco
    const storagePath = this.generateStoragePath(options.fileOwnerUserId || null, options.usage);
    const relativePath = await this.saveFileToDisk(file, storagePath);

    // Crear registro en DB
    const fileEntity = this.fileRepository.create({
      filename: path.basename(relativePath),
      originalName: file.originalname,
      name: options.name || file.originalname,
      description: options.description || null,
      mimetype: file.mimetype,
      size: file.size,
      path: relativePath,
      uploadedByUserId,
      fileOwnerUserId: options.fileOwnerUserId || null,
      usage: options.usage,
      isPublic: options.isPublic || false,
      downloadCount: 0,
    });

    const saved = await this.fileRepository.save(fileEntity);

    // Auditar
    await this.auditService.log({
      userId: uploadedByUserId,
      action: 'upload',
      entity: 'File',
      entityId: saved.id,
      metadata: {
        filename: saved.originalName,
        size: saved.size,
        mimetype: saved.mimetype,
        usage: saved.usage,
        fileOwnerUserId: saved.fileOwnerUserId,
      },
    });

    return saved;
  }

  /**
   * Lista archivos con filtros
   */
  async findAll(
    filters: ListFilesDto,
    userId?: string,
    hasListPermission = false,
  ): Promise<File[]> {
    const qb = this.fileRepository.createQueryBuilder('file');

    // Si el usuario NO tiene permiso list, solo ve sus archivos
    if (!hasListPermission && userId) {
      qb.where('file.fileOwnerUserId = :userId', { userId });
    }

    // Filtros opcionales
    if (filters.usage) {
      qb.andWhere('file.usage = :usage', { usage: filters.usage });
    }

    if (filters.fileOwnerUserId) {
      qb.andWhere('file.fileOwnerUserId = :fileOwnerUserId', {
        fileOwnerUserId: filters.fileOwnerUserId,
      });
    }

    if (filters.isPublic !== undefined) {
      qb.andWhere('file.isPublic = :isPublic', { isPublic: filters.isPublic });
    }

    if (filters.search) {
      qb.andWhere('(file.name ILIKE :search OR file.description ILIKE :search)', {
        search: `%${filters.search}%`,
      });
    }

    qb.orderBy('file.createdAt', 'DESC');

    return qb.getMany();
  }

  /**
   * Obtiene un archivo por ID con validación de acceso
   */
  async findOne(id: string, userId?: string, hasDownloadPermission = false): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, 'Archivo no encontrado');
    }

    // Validar acceso
    const isOwner = file.fileOwnerUserId === userId;
    const canAccess = file.isPublic || hasDownloadPermission || isOwner;

    if (!canAccess) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN,
        'No tienes acceso a este archivo',
      );
    }

    return file;
  }

  /**
   * Descarga un archivo
   */
  async download(
    id: string,
    userId?: string,
    hasDownloadPermission = false,
  ): Promise<{ file: File; stream: StreamableFile }> {
    const file = await this.findOne(id, userId, hasDownloadPermission);

    const fullPath = path.join(this.uploadPath, file.path);

    if (!existsSync(fullPath)) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        ErrorCode.NOT_FOUND,
        'Archivo físico no encontrado',
      );
    }

    // Incrementar contador de descargas
    await this.fileRepository.increment({ id }, 'downloadCount', 1);

    // Auditar
    await this.auditService.log({
      userId: userId || null,
      action: 'download',
      entity: 'File',
      entityId: file.id,
      metadata: {
        filename: file.originalName,
        usage: file.usage,
      },
    });

    const stream = createReadStream(fullPath);
    return { file, stream: new StreamableFile(stream) };
  }

  /**
   * Actualiza un archivo (requiere permiso files.edit)
   */
  async update(id: string, dto: UpdateFileDto, userId: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, 'Archivo no encontrado');
    }

    const before = { ...file };

    if (dto.name !== undefined) file.name = dto.name;
    if (dto.description !== undefined) file.description = dto.description;
    if (dto.fileOwnerUserId !== undefined) file.fileOwnerUserId = dto.fileOwnerUserId;

    const updated = await this.fileRepository.save(file);

    // Auditar
    await this.auditService.log({
      userId,
      action: 'update',
      entity: 'File',
      entityId: file.id,
      metadata: { before, after: updated },
    });

    return updated;
  }

  /**
   * Elimina un archivo (requiere permiso files.delete)
   */
  async remove(id: string, userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, 'Archivo no encontrado');
    }

    // Eliminar archivo físico
    const fullPath = path.join(this.uploadPath, file.path);
    if (existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }

    // Eliminar registro
    await this.fileRepository.remove(file);

    // Auditar
    await this.auditService.log({
      userId,
      action: 'delete',
      entity: 'File',
      entityId: id,
      metadata: {
        filename: file.originalName,
        usage: file.usage,
      },
    });
  }
}
