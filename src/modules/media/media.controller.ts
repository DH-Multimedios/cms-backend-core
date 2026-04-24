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
import { MediaService } from './media.service';
import { UploadMediaDto, UpdateMediaDto, ListMediaDto } from './dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Media')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiBearerAuth()
  @RequirePermissions('media.upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir una imagen' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        alt: { type: 'string', example: 'Logo de la empresa en fondo blanco' },
        usage: { type: 'string', example: 'logos', nullable: true },
      },
      required: ['file', 'alt'],
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
    @CurrentUser() user: User,
  ) {
    return this.mediaService.upload(file, user.id, {
      alt: dto.alt,
      usage: dto.usage,
    });
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar imágenes — con permiso media.list ve todas, sin permiso solo las suyas',
  })
  async findAll(@Query() filters: ListMediaDto, @CurrentUser() user?: User) {
    const hasListPermission = user?.roles?.some((role) =>
      role.permissions?.some((p) => p.name === 'media.list'),
    );

    return this.mediaService.findAll(filters, user?.id, hasListPermission);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener detalles de una imagen' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: User) {
    const hasReadPermission = user?.roles?.some((role) =>
      role.permissions?.some((p) => p.name === 'media.read'),
    );

    return this.mediaService.findOne(id, user?.id, hasReadPermission);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('media.edit')
  @ApiOperation({ summary: 'Editar el texto alternativo (alt) de una imagen' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMediaDto,
    @CurrentUser() user: User,
  ) {
    const hasEditPermission = user?.roles?.some((role) =>
      role.permissions?.some((p) => p.name === 'media.edit'),
    );

    return this.mediaService.update(id, dto, user.id, hasEditPermission);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions('media.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar imagen — borra el archivo físico y el registro' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const hasDeletePermission = user?.roles?.some((role) =>
      role.permissions?.some((p) => p.name === 'media.delete'),
    );

    await this.mediaService.remove(id, user.id, hasDeletePermission);
  }
}
