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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Listar usuarios' })
  findAll(@Query() query: UsersQueryDto, @CurrentUser() currentUser: User) {
    return this.usersService.findAll(query, currentUser);
  }

  @Get('list')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Listado liviano de usuarios (para selects)' })
  findList(@CurrentUser() currentUser: User) {
    return this.usersService.findList(currentUser);
  }

  @Get('by-username/:username')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Obtener usuario por username' })
  findByUsername(@Param('username') username: string, @CurrentUser() currentUser: User) {
    return this.usersService.findByUsername(username, currentUser);
  }

  @Get(':id')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: User) {
    return this.usersService.findOne(id, currentUser);
  }

  @Post()
  @RequirePermissions('users.create')
  @ApiOperation({ summary: 'Crear usuario' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil propio' })
  updateMe(@CurrentUser() currentUser: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(currentUser, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        alt: { type: 'string', nullable: true },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Subir avatar propio' })
  uploadMyAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
    @Body('alt') alt?: string,
  ) {
    return this.usersService.uploadAvatar(currentUser.id, file, alt);
  }

  @Post(':id/avatar')
  @RequirePermissions('users.update')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        alt: { type: 'string', nullable: true },
      },
      required: ['file'],
    },
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Subir avatar de un usuario (admin)' })
  uploadUserAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('alt') alt?: string,
  ) {
    return this.usersService.uploadAvatar(id, file, alt);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Eliminar avatar propio' })
  removeMyAvatar(@CurrentUser() currentUser: User) {
    return this.usersService.removeAvatar(currentUser.id);
  }

  @Delete(':id/avatar')
  @RequirePermissions('users.update')
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOperation({ summary: 'Eliminar avatar de un usuario (admin)' })
  removeUserAvatar(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.removeAvatar(id);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Eliminar usuario' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: User) {
    return this.usersService.remove(id, currentUser);
  }
}
