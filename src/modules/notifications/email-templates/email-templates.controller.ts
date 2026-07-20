import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { ListEmailTemplatesDto } from './dto/list-email-templates.dto';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';

@ApiTags('Email Templates')
@ApiCookieAuth('session')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('email-templates')
export class EmailTemplatesController {
  constructor(private readonly service: EmailTemplatesService) {}

  @Get()
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Listar todos los templates de email' })
  findAll(@Query() query: ListEmailTemplatesDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Obtener template por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Crear template de email' })
  create(@Body() dto: CreateEmailTemplateDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Actualizar template — recompila el HTML automáticamente' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmailTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('notifications.manage')
  @ApiOperation({ summary: 'Eliminar template (no aplica a templates por defecto)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
