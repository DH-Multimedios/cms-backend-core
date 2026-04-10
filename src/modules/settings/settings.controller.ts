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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingsQueryDto } from './dto/settings-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar settings (público)' })
  findAll(@Query() query: SettingsQueryDto) {
    return this.settingsService.findAll(query);
  }

  @Get(':key')
  @Public()
  @ApiOperation({ summary: 'Obtener setting por key (público)' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findByKey(key);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('settings.create')
  @ApiOperation({ summary: 'Crear setting' })
  create(@Body() dto: CreateSettingDto) {
    return this.settingsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Actualizar setting' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions('settings.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar setting' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.settingsService.remove(id);
  }
}
