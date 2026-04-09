import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class PermissionsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Busca en name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por módulo' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ enum: ['name', 'module', 'createdAt'], default: 'createdAt' })
  @IsOptional()
  @IsIn(['name', 'module', 'createdAt'])
  sortBy?: string = 'createdAt';
}
