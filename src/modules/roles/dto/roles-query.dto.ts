import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class RolesQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Busca en name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['weight', 'name', 'createdAt'], default: 'weight' })
  @IsOptional()
  @IsIn(['weight', 'name', 'createdAt'])
  sortBy?: string = 'weight';
}
