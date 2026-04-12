import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { UploadFileDto, UpdateFileDto, ListFilesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Files')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiBearerAuth()
  @RequirePermissions('files.upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir un archivo' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        fileOwnerUserId: { type: 'string', format: 'uuid', nullable: true },
        usage: { type: 'string', example: 'contracts' },
        name: { type: 'string', nullable: true },
        description: { type: 'string', nullable: true },
        isPublic: { type: 'boolean', default: false },
      },
      required: ['file', 'usage'],
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @CurrentUser() user: User,
  ) {
    return this.filesService.upload(file, user.id, {
      fileOwnerUserId: dto.fileOwnerUserId,
      usage: dto.usage,
      name: dto.name,
      description: dto.description,
      isPublic: dto.isPublic,
    });
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar archivos — con permiso files.list ve todos, sin permiso solo los suyos',
  })
  async findAll(@Query() filters: ListFilesDto, @CurrentUser() user?: User) {
    const hasListPermission =
      user?.isSystemUser ||
      user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'files.list'));

    return this.filesService.findAll(filters, user?.id, hasListPermission);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener detalles de un archivo (público si isPublic=true)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: User) {
    const hasDownloadPermission =
      user?.isSystemUser ||
      user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'files.download'));

    return this.filesService.findOne(id, user?.id, hasDownloadPermission);
  }

  @Get(':id/download')
  @Public()
  @ApiOperation({
    summary: 'Descargar archivo — público si isPublic=true, sino requiere permisos o ser dueño',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user?: User,
  ) {
    const hasDownloadPermission =
      user?.isSystemUser ||
      user?.roles?.some((role) => role.permissions?.some((p) => p.name === 'files.download'));

    const { file, stream } = await this.filesService.download(id, user?.id, hasDownloadPermission);

    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      'Content-Length': file.size,
    });

    return stream;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('files.edit')
  @ApiOperation({ summary: 'Editar nombre, descripción o dueño del archivo' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFileDto,
    @CurrentUser() user: User,
  ) {
    return this.filesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions('files.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar archivo — borra el archivo físico y el registro' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.filesService.remove(id, user.id);
  }
}
