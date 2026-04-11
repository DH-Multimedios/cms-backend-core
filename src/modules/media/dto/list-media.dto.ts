import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListMediaDto {
  @ApiPropertyOptional({ description: 'Filtrar por categoría de uso' })
  @IsOptional()
  @IsString()
  usage?: string;

  @ApiPropertyOptional({ description: 'Filtrar por usuario que subió la imagen' })
  @IsOptional()
  @IsUUID()
  uploadedByUserId?: string;

  @ApiPropertyOptional({ description: 'Búsqueda por texto alternativo o nombre original' })
  @IsOptional()
  @IsString()
  search?: string;
}
