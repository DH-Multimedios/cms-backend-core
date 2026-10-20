import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { NotificationPreferencesService } from './notification-preferences.service.js';
import { UpsertNotificationPreferenceDto } from './dto/upsert-notification-preference.dto.js';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard.js';
import { PermissionsGuard } from '../../auth/guards/permissions.guard.js';
import { CurrentUser } from '../../auth/decorators/current-user.decorator.js';
import { User } from '../../../database/entities/user.entity.js';

@ApiTags('Notification Preferences')
@ApiCookieAuth('session')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('notification-preferences')
export class NotificationPreferencesController {
  constructor(private readonly service: NotificationPreferencesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Ver mis preferencias de notificación' })
  findMine(@CurrentUser() user: User) {
    return this.service.findForUser(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Crear o actualizar una preferencia de notificación' })
  upsert(@CurrentUser() user: User, @Body() dto: UpsertNotificationPreferenceDto) {
    return this.service.upsert(user.id, dto);
  }
}
