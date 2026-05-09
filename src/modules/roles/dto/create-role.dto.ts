import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'editor', description: 'Identificador interno en snake_case' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_]*$/, { message: 'name debe ser snake_case (ej: editor, super_admin)' })
  name: string;

  @ApiProperty({ example: 'Editor', description: 'Etiqueta visible en la UI' })
  @IsString()
  label: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Peso para ordenamiento en UI (0-100)', default: 0 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Solo el usuario del sistema puede crear roles protegidos' })
  @IsBoolean()
  @IsOptional()
  isProtected?: boolean;
}
