import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { UserPreferencesService } from './user-preferences.service';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('User Preferences')
@ApiCookieAuth('session')
@UseGuards(SessionAuthGuard)
@Controller('user-preferences')
export class UserPreferencesController {
  constructor(private readonly service: UserPreferencesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener mis preferencias de usuario' })
  findMine(@CurrentUser() user: User) {
    return this.service.findOrCreate(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar mis preferencias de usuario' })
  updateMine(@CurrentUser() user: User, @Body() dto: UpdateUserPreferenceDto) {
    return this.service.update(user.id, dto);
  }
}
