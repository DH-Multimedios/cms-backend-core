import { IsOptional, IsString, IsUUID, IsBoolean, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListFilesDto extends PaginationDto {
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

  @ApiPropertyOptional({ enum: ['createdAt', 'name', 'size'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['createdAt', 'name', 'size'])
  sortBy?: string = 'createdAt';
}
