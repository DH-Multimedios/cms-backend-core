import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationTypeDto {
  @ApiProperty({ example: 'user.welcome' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'user' })
  @IsString()
  entityType: string;

  @ApiProperty({ example: 'welcome' })
  @IsString()
  notificationType: string;

  @ApiProperty({ example: 'Email de bienvenida' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: true, description: 'El usuario puede desactivarlo desde su perfil' })
  @IsBoolean()
  @IsOptional()
  userConfigurable?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Activo por defecto para usuarios nuevos' })
  @IsBoolean()
  @IsOptional()
  defaultEnabled?: boolean;
}
