"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("../../database/entities/file.entity");
const settings_service_1 = require("../settings/settings.service");
const audit_service_1 = require("../audit/audit.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const uuid_1 = require("uuid");
let FilesService = class FilesService {
    fileRepository;
    settingsService;
    auditService;
    uploadPath = process.env.UPLOADS_PATH || 'uploads/files';
    constructor(fileRepository, settingsService, auditService) {
        this.fileRepository = fileRepository;
        this.settingsService = settingsService;
        this.auditService = auditService;
    }
    async validateFile(file) {
        const allowedMimetypesStr = await this.settingsService.getValue('files.allowedMimetypes');
        const maxFileSizeStr = await this.settingsService.getValue('files.maxFileSize');
        if (!allowedMimetypesStr || !maxFileSizeStr) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.INTERNAL_SERVER_ERROR, error_codes_enum_1.ErrorCode.INTERNAL_ERROR, 'Configuración de archivos no encontrada. Verifica que existan los settings files.allowedMimetypes y files.maxFileSize');
        }
        const allowedMimetypes = JSON.parse(allowedMimetypesStr);
        const maxFileSize = parseInt(maxFileSizeStr, 10);
        if (!allowedMimetypes.includes(file.mimetype)) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, `Tipo de archivo no permitido. Tipos permitidos: ${allowedMimetypes.join(', ')}`);
        }
        if (file.size > maxFileSize) {
            const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, `El archivo excede el tamaño máximo permitido (${maxSizeMB}MB)`);
        }
    }
    generateStoragePath(fileOwnerUserId, usage) {
        const date = new Date().toISOString().split('T')[0];
        const owner = fileOwnerUserId || 'system';
        return path.join(owner, usage, date);
    }
    async saveFileToDisk(file, storagePath) {
        const extension = path.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${extension}`;
        const fullPath = path.join(this.uploadPath, storagePath);
        const filePath = path.join(fullPath, filename);
        await fs.mkdir(fullPath, { recursive: true });
        await fs.writeFile(filePath, file.buffer);
        return path.join(storagePath, filename);
    }
    async upload(file, uploadedByUserId, options) {
        await this.validateFile(file);
        const storagePath = this.generateStoragePath(options.fileOwnerUserId || null, options.usage);
        const relativePath = await this.saveFileToDisk(file, storagePath);
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
    async findAll(filters, userId, hasListPermission = false) {
        const { page = 1, limit = 20, sortOrder = 'DESC', sortBy = 'createdAt' } = filters;
        const qb = this.fileRepository.createQueryBuilder('file');
        if (!hasListPermission && userId) {
            qb.where('file.fileOwnerUserId = :userId', { userId });
        }
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
        qb.orderBy(`file.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id, userId, hasDownloadPermission = false) {
        const file = await this.fileRepository.findOne({ where: { id } });
        if (!file) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, 'Archivo no encontrado');
        }
        const isOwner = file.fileOwnerUserId === userId;
        const canAccess = file.isPublic || hasDownloadPermission || isOwner;
        if (!canAccess) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.FORBIDDEN, error_codes_enum_1.ErrorCode.FORBIDDEN, 'No tienes acceso a este archivo');
        }
        return file;
    }
    async download(id, userId, hasDownloadPermission = false) {
        const file = await this.findOne(id, userId, hasDownloadPermission);
        const fullPath = path.join(this.uploadPath, file.path);
        if (!(0, fs_1.existsSync)(fullPath)) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, 'Archivo físico no encontrado');
        }
        await this.fileRepository.increment({ id }, 'downloadCount', 1);
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
        const stream = (0, fs_1.createReadStream)(fullPath);
        return { file, stream: new common_1.StreamableFile(stream) };
    }
    async update(id, dto, userId) {
        const file = await this.fileRepository.findOne({ where: { id } });
        if (!file) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, 'Archivo no encontrado');
        }
        const before = { ...file };
        if (dto.name !== undefined)
            file.name = dto.name;
        if (dto.description !== undefined)
            file.description = dto.description;
        if (dto.fileOwnerUserId !== undefined)
            file.fileOwnerUserId = dto.fileOwnerUserId;
        const updated = await this.fileRepository.save(file);
        await this.auditService.log({
            userId,
            action: 'update',
            entity: 'File',
            entityId: file.id,
            metadata: { before, after: updated },
        });
        return updated;
    }
    async remove(id, userId) {
        const file = await this.fileRepository.findOne({ where: { id } });
        if (!file) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, 'Archivo no encontrado');
        }
        const fullPath = path.join(this.uploadPath, file.path);
        if ((0, fs_1.existsSync)(fullPath)) {
            await fs.unlink(fullPath);
        }
        await this.fileRepository.remove(file);
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
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        settings_service_1.SettingsService,
        audit_service_1.AuditService])
], FilesService);
//# sourceMappingURL=files.service.js.map