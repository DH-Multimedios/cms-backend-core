import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Setting Categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('setting-categories')
export class SettingCategoriesController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar categorías con sus settings (público)' })
  findAll() {
    return this.settingsService.findAllCategories();
  }

  @Get(':key')
  @Public()
  @ApiOperation({ summary: 'Obtener categoría por key con sus settings (público)' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findCategoryByKey(key);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('settings.create')
  @ApiOperation({ summary: 'Crear categoría' })
  create(@Body() dto: CreateCategoryDto) {
    return this.settingsService.createCategory(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.settingsService.updateCategory(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions('settings.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar categoría (solo si no tiene settings)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.removeCategory(id);
  }
}
