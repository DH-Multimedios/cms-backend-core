import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpsertNotificationPreferenceDto } from './dto/upsert-notification-preference.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../../database/entities/user.entity';

@ApiTags('Notification Preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
