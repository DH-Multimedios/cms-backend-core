import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TaxonomiesService } from './taxonomies.service';
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto';
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto';
import { QueryTaxonomyDto } from './dto/query-taxonomy.dto';
import { ReorderTaxonomiesDto } from './dto/reorder-taxonomies.dto';
import { SyncEntityTaxonomiesDto } from './dto/sync-entity-taxonomies.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Taxonomies')
@UseGuards(SessionAuthGuard, PermissionsGuard)
@Controller('taxonomies')
export class TaxonomiesController {
  constructor(private readonly taxonomiesService: TaxonomiesService) {}

  // ─── Rutas específicas ANTES de /:id ──────────────────────────────────────

  @Get('entity/:entityType/:entityId')
  @Public()
  @ApiOperation({ summary: 'Obtener taxonomías asociadas a una entidad (público)' })
  @ApiParam({ name: 'entityType', example: 'Product' })
  @ApiParam({ name: 'entityId', example: 'uuid' })
  findForEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.taxonomiesService.findForEntity(entityType, entityId);
  }

  @Put('entity/:entityType/:entityId')
  @ApiCookieAuth('session')
  @RequirePermissions('taxonomies.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincronizar taxonomías de una entidad — reemplaza todas las existentes',
  })
  @ApiParam({ name: 'entityType', example: 'Product' })
  @ApiParam({ name: 'entityId', example: 'uuid' })
  syncEntity(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Body() dto: SyncEntityTaxonomiesDto,
  ) {
    return this.taxonomiesService.syncEntity(entityType, entityId, dto.taxonomyIds);
  }

  @Patch('reorder')
  @ApiCookieAuth('session')
  @RequirePermissions('taxonomies.update')
  @ApiOperation({ summary: 'Reordenar taxonomías — enviar IDs en el orden deseado' })
  reorder(@Body() dto: ReorderTaxonomiesDto) {
    return this.taxonomiesService.reorder(dto);
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar taxonomías con paginación y filtros (público)' })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por vocabulario' })
  @ApiQuery({ name: 'parentId', required: false, description: 'Filtrar por UUID del padre' })
  @ApiQuery({ name: 'root', required: false, description: 'true → solo nodos raíz' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: QueryTaxonomyDto) {
    return this.taxonomiesService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener taxonomía por ID con conteo de hijos (público)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.taxonomiesService.findOne(id);
  }

  @Post()
  @ApiCookieAuth('session')
  @RequirePermissions('taxonomies.create')
  @ApiOperation({ summary: 'Crear taxonomía (slug auto-generado si no se envía)' })
  create(@Body() dto: CreateTaxonomyDto) {
    return this.taxonomiesService.create(dto);
  }

  @Patch(':id')
  @ApiCookieAuth('session')
  @RequirePermissions('taxonomies.update')
  @ApiOperation({
    summary: 'Actualizar taxonomía — slug se regenera si cambia el name y no se envía slug',
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaxonomyDto) {
    return this.taxonomiesService.update(id, dto);
  }

  @Delete(':id')
  @ApiCookieAuth('session')
  @RequirePermissions('taxonomies.delete')
  @ApiOperation({ summary: 'Eliminar taxonomía — falla si tiene hijos' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.taxonomiesService.remove(id);
  }
}
