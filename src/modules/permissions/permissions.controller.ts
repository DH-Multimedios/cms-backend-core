import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionsQueryDto } from './dto/permissions-query.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@ApiTags('Permissions')
@ApiCookieAuth('session')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('list')
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Listar permisos (select/checkbox)' })
  findList() {
    return this.permissionsService.findList();
  }

  @Get()
  @RequirePermissions('permissions.read')
  @ApiOperation({ summary: 'Listar permisos' })
  findAll(@Query() query: PermissionsQueryDto) {
    return this.permissionsService.findAll(query);
  }
}
