import { IsOptional, IsString, IsUUID, IsInt, Min, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTaxonomyDto {
  @ApiPropertyOptional({ example: 'category', description: 'Filtrar por vocabulario/tipo' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Filtrar por UUID del padre' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'true → solo nodos raíz (parentId IS NULL)' })
  @IsBooleanString()
  @IsOptional()
  root?: string;

  @ApiPropertyOptional({ description: 'Buscar por nombre' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
