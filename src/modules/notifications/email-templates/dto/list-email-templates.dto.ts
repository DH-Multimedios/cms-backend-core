import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class ListEmailTemplatesDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por entityType' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    enum: ['entityType', 'notificationType', 'name', 'createdAt'],
    default: 'entityType',
  })
  @IsOptional()
  @IsIn(['entityType', 'notificationType', 'name', 'createdAt'])
  sortBy?: string = 'entityType';
}
