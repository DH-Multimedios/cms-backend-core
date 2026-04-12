import { IsOptional, IsString, IsUUID, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ListMediaDto extends PaginationDto {
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

  @ApiPropertyOptional({ enum: ['createdAt', 'originalName', 'size'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['createdAt', 'originalName', 'size'])
  sortBy?: string = 'createdAt';
}
