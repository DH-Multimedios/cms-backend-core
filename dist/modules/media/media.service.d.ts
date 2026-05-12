import { Repository } from 'typeorm';
import { Media } from '../../database/entities/media.entity';
import { SettingsService } from '../settings/settings.service';
import { AuditService } from '../audit/audit.service';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { ListMediaDto, UpdateMediaDto } from './dto';
export declare class MediaService {
    private readonly mediaRepository;
    private readonly settingsService;
    private readonly auditService;
    private readonly uploadPath;
    constructor(mediaRepository: Repository<Media>, settingsService: SettingsService, auditService: AuditService);
    private validateImage;
    private generateStoragePath;
    private extractImageMetadata;
    private saveImageToDisk;
    private generatePublicUrl;
    upload(file: Express.Multer.File, uploadedByUserId: string, options: {
        alt: string;
        usage?: string;
    }): Promise<Media>;
    findAll(filters: ListMediaDto, userId?: string, hasListPermission?: boolean): Promise<PaginatedResult<Media>>;
    findOne(id: string, userId?: string, hasReadPermission?: boolean): Promise<Media>;
    update(id: string, updateDto: UpdateMediaDto, userId: string, hasEditPermission?: boolean): Promise<Media>;
    remove(id: string, userId: string, hasDeletePermission?: boolean): Promise<void>;
}
//# sourceMappingURL=media.service.d.ts.map