import { MediaService } from './media.service';
import { UploadMediaDto, UpdateMediaDto, ListMediaDto } from './dto';
import { User } from '../../database/entities/user.entity';
export declare class MediaController {
    private readonly mediaService;
    constructor(mediaService: MediaService);
    upload(file: Express.Multer.File, dto: UploadMediaDto, user: User): Promise<import("../..").Media>;
    findAll(filters: ListMediaDto, user?: User): Promise<import("../..").PaginatedResult<import("../..").Media>>;
    findOne(id: string, user?: User): Promise<import("../..").Media>;
    update(id: string, dto: UpdateMediaDto, user: User): Promise<import("../..").Media>;
    remove(id: string, user: User): Promise<void>;
}
//# sourceMappingURL=media.controller.d.ts.map