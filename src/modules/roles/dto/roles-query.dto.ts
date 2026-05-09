import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class RolesQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Busca en name o label' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['weight', 'name', 'label', 'createdAt'], default: 'weight' })
  @IsOptional()
  @IsIn(['weight', 'name', 'label', 'createdAt'])
  sortBy?: string = 'weight';
}
