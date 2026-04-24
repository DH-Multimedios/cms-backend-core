import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationTypesService } from './notification-types.service';
import { CreateNotificationTypeDto } from './dto/create-notification-type.dto';
import { UpdateNotificationTypeDto } from './dto/update-notification-type.dto';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Notification Types')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('notification-types')
export class NotificationTypesController {
  constructor(private readonly service: NotificationTypesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar tipos de notificación (público — usado en panel de preferencias)' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Obtener tipo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Registrar nuevo tipo de notificación' })
  create(@Body() dto: CreateNotificationTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Actualizar tipo — incluye toggle isEnabled' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNotificationTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Eliminar tipo de notificación' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
