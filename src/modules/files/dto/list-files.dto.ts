import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListFilesDto {
  @ApiPropertyOptional({ description: 'Filtrar por categoría de uso' })
  @IsOptional()
  @IsString()
  usage?: string;

  @ApiPropertyOptional({ description: 'Filtrar por dueño del archivo' })
  @IsOptional()
  @IsUUID()
  fileOwnerUserId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por archivos públicos o privados' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Búsqueda por nombre o descripción' })
  @IsOptional()
  @IsString()
  search?: string;
}
