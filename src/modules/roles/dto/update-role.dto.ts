import { IsString, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: 'Identificador interno en snake_case' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, { message: 'name debe ser snake_case (ej: editor, super_admin)' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Etiqueta visible en la UI' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Peso para ordenamiento en UI (0-100)' })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  weight?: number;
}
