import { IsString, IsOptional, IsInt, Min, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'general', description: 'Identificador único (slug)' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'El key solo puede contener letras minúsculas, números y guiones' })
  key: string;

  @ApiProperty({ example: 'Configuración General' })
  @IsString()
  label: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
