import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SettingsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por key de categoría (ej: general, email)' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoryId' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  categoryId?: number;
}
