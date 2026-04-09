import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({ type: [String], description: 'IDs de permisos a asignar al rol' })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
