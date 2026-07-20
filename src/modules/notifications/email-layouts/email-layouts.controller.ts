import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { EmailLayoutsService } from './email-layouts.service';
import { CreateEmailLayoutDto } from './dto/create-email-layout.dto';
import { UpdateEmailLayoutDto } from './dto/update-email-layout.dto';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { EmailLayoutType } from '../../../database/entities/email-layout.entity';

@ApiTags('Email Layouts')
@ApiCookieAuth('session')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('email-layouts')
export class EmailLayoutsController {
  constructor(private readonly service: EmailLayoutsService) {}

  @Get()
  @RequirePermissions('notifications.manage')
  @ApiQuery({ name: 'type', enum: ['header', 'footer'], required: false })
  @ApiOperation({ summary: 'Listar layouts (headers/footers) — filtrable por type' })
  findAll(@Query('type') type?: EmailLayoutType) {
    return this.service.findAll(type);
  }

  @Get(':id')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Obtener layout por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Crear layout' })
  create(@Body() dto: CreateEmailLayoutDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Actualizar layout' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmailLayoutDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Eliminar layout' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
