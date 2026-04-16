import { IsArray, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePermissionsDto {
  @ApiProperty({ type: [String], description: 'IDs de permisos a agregar', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  add?: string[];

  @ApiProperty({ type: [String], description: 'IDs de permisos a remover', required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  remove?: string[];
}
