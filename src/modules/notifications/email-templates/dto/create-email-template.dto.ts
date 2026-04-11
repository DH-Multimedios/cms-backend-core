import { IsString, IsInt, IsArray, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Section } from '../../../../database/entities/notification-block.types';

export class CreateEmailTemplateDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  entityType: string;

  @ApiProperty({ example: 'welcome' })
  @IsString()
  notificationType: string;

  @ApiProperty({ example: 'Email de bienvenida' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Bienvenido {{firstName}}' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ description: 'ID del header layout' })
  @IsInt()
  @Min(1)
  @IsOptional()
  headerId?: number | null;

  @ApiPropertyOptional({ description: 'ID del footer layout' })
  @IsInt()
  @Min(1)
  @IsOptional()
  footerId?: number | null;

  @ApiProperty({ description: 'Secciones del body con columnas y bloques' })
  @IsArray()
  bodySections: Section[];

  @ApiPropertyOptional({ example: ['firstName', 'verificationUrl'], description: 'Variables disponibles — documentación para el editor' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];
}
