import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Setting Categories')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('setting-categories')
export class SettingCategoriesController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar categorías paginadas con cantidad de settings (público)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.settingsService.findAllCategories(Number(page), Number(limit));
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Obtener categoría por slug con sus settings paginados (público)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findOne(@Param('slug') slug: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.settingsService.findCategoryBySlug(slug, Number(page), Number(limit));
  }

  @Post()
  @ApiCookieAuth('session')
  @RequirePermissions('settings.create')
  @ApiOperation({ summary: 'Crear categoría (slug auto-generado si no se envía)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.settingsService.createCategory(dto);
  }

  @Patch('reorder')
  @ApiCookieAuth('session')
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Reordenar categorías — enviar IDs en el orden deseado' })
  reorder(@Body() dto: ReorderCategoriesDto) {
    return this.settingsService.reorderCategories(dto);
  }

  @Patch(':id')
  @ApiCookieAuth('session')
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.settingsService.updateCategory(id, dto);
  }

  @Delete(':id')
  @ApiCookieAuth('session')
  @RequirePermissions('settings.delete')
  @ApiOperation({ summary: 'Eliminar categoría (solo si no tiene settings)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.removeCategory(id);
  }
}
