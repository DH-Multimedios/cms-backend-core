import { Response } from 'express';
import { FilesService } from './files.service';
import { UploadFileDto, UpdateFileDto, ListFilesDto } from './dto';
import { User } from '../../database/entities/user.entity';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    upload(file: Express.Multer.File, dto: UploadFileDto, user: User): Promise<import("../..").File>;
    findAll(filters: ListFilesDto, user?: User): Promise<import("../..").PaginatedResult<import("../..").File>>;
    findOne(id: string, user?: User): Promise<import("../..").File>;
    download(id: string, res: Response, user?: User): Promise<import("@nestjs/common").StreamableFile>;
    update(id: string, dto: UpdateFileDto, user: User): Promise<import("../..").File>;
    remove(id: string, user: User): Promise<void>;
}
//# sourceMappingURL=files.controller.d.ts.map