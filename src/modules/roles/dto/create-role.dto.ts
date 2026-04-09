import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Editor' })
  @IsString()
  name: string;

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
