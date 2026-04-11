import { IsString, IsOptional, IsUUID, IsInt, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaxonomyDto {
  @ApiProperty({ example: 'Remeras' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'remeras', description: 'Auto-generado desde name si no se envía' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'category', description: 'Vocabulario libre — e.g. category, tag, status' })
  @IsString()
  @MaxLength(100)
  type: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'UUID del registro en Media (opcional)' })
  @IsUUID()
  @IsOptional()
  imageId?: string;

  @ApiPropertyOptional({ description: 'UUID del padre — null para nodo raíz' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
