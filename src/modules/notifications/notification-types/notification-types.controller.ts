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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { NotificationTypesService } from './notification-types.service.js';
import { CreateNotificationTypeDto } from './dto/create-notification-type.dto.js';
import { UpdateNotificationTypeDto } from './dto/update-notification-type.dto.js';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator.js';
import { Public } from '../../auth/decorators/public.decorator.js';

@ApiTags('Notification Types')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('notification-types')
export class NotificationTypesController {
  constructor(private readonly service: NotificationTypesService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Listar tipos de notificación (público — usado en panel de preferencias)',
  })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiCookieAuth('session')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Obtener tipo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiCookieAuth('session')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Registrar nuevo tipo de notificación' })
  create(@Body() dto: CreateNotificationTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiCookieAuth('session')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Actualizar tipo — incluye toggle isEnabled' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNotificationTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiCookieAuth('session')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Eliminar tipo de notificación' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
