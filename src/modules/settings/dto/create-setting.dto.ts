import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SettingType } from '../../../database/entities/setting.entity';

const SETTING_TYPES: SettingType[] = ['string', 'number', 'boolean', 'json', 'password'];

export class CreateSettingDto {
  @ApiPropertyOptional({ description: 'ID de la categoría' })
  @IsInt()
  @Min(1)
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ example: 'app.name', description: 'Clave única del setting' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Nombre de la aplicación' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'Mi App' })
  @IsString()
  value: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: SETTING_TYPES, default: 'string' })
  @IsIn(SETTING_TYPES)
  @IsOptional()
  type?: SettingType;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
