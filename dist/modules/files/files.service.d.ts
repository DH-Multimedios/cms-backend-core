import { StreamableFile } from '@nestjs/common';
import { Repository } from 'typeorm';
import { File } from '../../database/entities/file.entity';
import { SettingsService } from '../settings/settings.service';
import { AuditService } from '../audit/audit.service';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { ListFilesDto, UpdateFileDto } from './dto';
export declare class FilesService {
    private readonly fileRepository;
    private readonly settingsService;
    private readonly auditService;
    private readonly uploadPath;
    constructor(fileRepository: Repository<File>, settingsService: SettingsService, auditService: AuditService);
    private validateFile;
    private generateStoragePath;
    private saveFileToDisk;
    upload(file: Express.Multer.File, uploadedByUserId: string, options: {
        fileOwnerUserId?: string;
        usage: string;
        name?: string;
        description?: string;
        isPublic?: boolean;
    }): Promise<File>;
    findAll(filters: ListFilesDto, userId?: string, hasListPermission?: boolean): Promise<PaginatedResult<File>>;
    findOne(id: string, userId?: string, hasDownloadPermission?: boolean): Promise<File>;
    download(id: string, userId?: string, hasDownloadPermission?: boolean): Promise<{
        file: File;
        stream: StreamableFile;
    }>;
    update(id: string, dto: UpdateFileDto, userId: string): Promise<File>;
    remove(id: string, userId: string): Promise<void>;
}
//# sourceMappingURL=files.service.d.ts.map