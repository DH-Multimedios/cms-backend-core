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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmailProvidersService } from './email-providers.service';
import { CreateEmailProviderDto } from './dto/create-email-provider.dto';
import { UpdateEmailProviderDto } from './dto/update-email-provider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@ApiTags('Email Providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('email-providers')
export class EmailProvidersController {
  constructor(private readonly service: EmailProvidersService) {}

  @Get()
  @RequirePermissions('email-providers.read')
  @ApiOperation({ summary: 'Listar providers de email' })
  findAll() {
    return this.service.findAll();
  }

  @Get('active')
  @RequirePermissions('email-providers.read')
  @ApiOperation({ summary: 'Obtener el provider activo' })
  findActive() {
    return this.service.findActive();
  }

  @Get(':id')
  @RequirePermissions('email-providers.read')
  @ApiOperation({ summary: 'Obtener provider por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions('email-providers.create')
  @ApiOperation({ summary: 'Crear provider de email' })
  create(@Body() dto: CreateEmailProviderDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('email-providers.update')
  @ApiOperation({ summary: 'Actualizar provider de email' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmailProviderDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/activate')
  @RequirePermissions('email-providers.update')
  @ApiOperation({ summary: 'Activar este provider (desactiva los demás)' })
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.service.activate(id);
  }

  @Delete(':id')
  @RequirePermissions('email-providers.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar provider (no puede estar activo)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
