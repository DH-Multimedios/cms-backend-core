import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncEntityTaxonomiesDto {
  @ApiProperty({
    type: [String],
    description: 'Array de taxonomyIds a asociar — reemplaza completamente las existentes',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  taxonomyIds: string[];
}
