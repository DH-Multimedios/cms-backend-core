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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { RolesQueryDto } from './dto/roles-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Listar roles' })
  findAll(@Query() query: RolesQueryDto) {
    return this.rolesService.findAll(query);
  }

  @Get('list')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Listar roles (select/checkbox)' })
  findList() {
    return this.rolesService.findList();
  }

  @Get(':id')
  @RequirePermissions('roles.read')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermissions('roles.create')
  @ApiOperation({ summary: 'Crear rol' })
  create(@Body() dto: CreateRoleDto, @CurrentUser() currentUser: User) {
    return this.rolesService.create(dto, currentUser);
  }

  @Patch(':id')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Actualizar rol' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.rolesService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('roles.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar rol' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: User) {
    return this.rolesService.remove(id, currentUser);
  }

  @Patch(':id/permissions')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Agregar/remover permisos a un rol (incremental)' })
  updatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionsDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.rolesService.updatePermissions(id, dto, currentUser);
  }

  @Post(':id/permissions')
  @RequirePermissions('roles.update')
  @ApiOperation({ summary: 'Asignar permisos a un rol' })
  assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.rolesService.assignPermissions(id, dto.permissionIds, currentUser);
  }
}
