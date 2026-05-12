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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const media_entity_1 = require("../../database/entities/media.entity");
const settings_service_1 = require("../settings/settings.service");
const audit_service_1 = require("../audit/audit.service");
const api_exception_1 = require("../../common/exceptions/api.exception");
const error_codes_enum_1 = require("../../common/enums/error-codes.enum");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const fs_1 = require("fs");
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
let MediaService = class MediaService {
    mediaRepository;
    settingsService;
    auditService;
    uploadPath = process.env.UPLOADS_PATH || 'uploads/media';
    constructor(mediaRepository, settingsService, auditService) {
        this.mediaRepository = mediaRepository;
        this.settingsService = settingsService;
        this.auditService = auditService;
    }
    async validateImage(file) {
        const allowedMimetypesStr = await this.settingsService.getValue('media.allowedMimetypes');
        const maxFileSizeStr = await this.settingsService.getValue('media.maxFileSize');
        if (!allowedMimetypesStr || !maxFileSizeStr) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.INTERNAL_SERVER_ERROR, error_codes_enum_1.ErrorCode.INTERNAL_ERROR, 'Configuración de media no encontrada. Verifica que existan los settings media.allowedMimetypes y media.maxFileSize');
        }
        const allowedMimetypes = JSON.parse(allowedMimetypesStr);
        const maxFileSize = parseInt(maxFileSizeStr, 10);
        if (!allowedMimetypes.includes(file.mimetype)) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, `Tipo de imagen no permitido. Tipos permitidos: ${allowedMimetypes.join(', ')}`);
        }
        if (file.size > maxFileSize) {
            const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(2);
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, `La imagen excede el tamaño máximo permitido (${maxSizeMB}MB)`);
        }
    }
    generateStoragePath(uploadedByUserId, usage) {
        const date = new Date().toISOString().split('T')[0];
        return path.join(uploadedByUserId, usage, date);
    }
    async extractImageMetadata(buffer) {
        try {
            const metadata = await (0, sharp_1.default)(buffer).metadata();
            return {
                width: metadata.width || 0,
                height: metadata.height || 0,
            };
        }
        catch (error) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.BAD_REQUEST, error_codes_enum_1.ErrorCode.VALIDATION_ERROR, 'No se pudo procesar la imagen. Asegúrate de que sea una imagen válida.');
        }
    }
    async saveImageToDisk(file, storagePath) {
        const extension = path.extname(file.originalname);
        const filename = `${(0, uuid_1.v4)()}${extension}`;
        const fullPath = path.join(this.uploadPath, storagePath);
        const filePath = path.join(fullPath, filename);
        await fs.mkdir(fullPath, { recursive: true });
        await fs.writeFile(filePath, file.buffer);
        return path.join(storagePath, filename);
    }
    generatePublicUrl(relativePath) {
        return `/uploads/media/${relativePath}`;
    }
    async upload(file, uploadedByUserId, options) {
        await this.validateImage(file);
        const { width, height } = await this.extractImageMetadata(file.buffer);
        const usage = options.usage || 'general';
        const storagePath = this.generateStoragePath(uploadedByUserId, usage);
        const relativePath = await this.saveImageToDisk(file, storagePath);
        const url = this.generatePublicUrl(relativePath);
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
    async findAll(filters, userId, hasListPermission = false) {
        const { page = 1, limit = 20, sortOrder = 'DESC', sortBy = 'createdAt' } = filters;
        const qb = this.mediaRepository.createQueryBuilder('media');
        if (!hasListPermission && userId) {
            qb.where('media.uploadedByUserId = :userId', { userId });
        }
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
        qb.orderBy(`media.${sortBy}`, sortOrder)
            .skip((page - 1) * limit)
            .take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit, pages: Math.ceil(total / limit) };
    }
    async findOne(id, userId, hasReadPermission = false) {
        const qb = this.mediaRepository.createQueryBuilder('media').where('media.id = :id', { id });
        if (!hasReadPermission && userId) {
            qb.andWhere('media.uploadedByUserId = :userId', { userId });
        }
        const media = await qb.getOne();
        if (!media) {
            throw new api_exception_1.ApiException(common_1.HttpStatus.NOT_FOUND, error_codes_enum_1.ErrorCode.NOT_FOUND, 'Imagen no encontrada');
        }
        return media;
    }
    async update(id, updateDto, userId, hasEditPermission = false) {
        const media = await this.findOne(id, userId, hasEditPermission);
        media.alt = updateDto.alt;
        media.updatedAt = new Date();
        const updated = await this.mediaRepository.save(media);
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
    async remove(id, userId, hasDeletePermission = false) {
        const media = await this.findOne(id, userId, hasDeletePermission);
        const fullPath = path.join(this.uploadPath, media.path);
        if ((0, fs_1.existsSync)(fullPath)) {
            await fs.unlink(fullPath);
        }
        await this.mediaRepository.remove(media);
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
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(media_entity_1.Media)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        settings_service_1.SettingsService,
        audit_service_1.AuditService])
], MediaService);
//# sourceMappingURL=media.service.js.map