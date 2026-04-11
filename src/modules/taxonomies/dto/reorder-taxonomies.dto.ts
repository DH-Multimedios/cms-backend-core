import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderTaxonomiesDto {
  @ApiProperty({
    type: [String],
    description: 'Array de UUIDs en el orden deseado — todos deben ser del mismo nivel (mismo parentId)',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  ids: string[];
}
