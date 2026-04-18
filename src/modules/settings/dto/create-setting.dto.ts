import { IsString, IsOptional, IsInt, Min, IsIn, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SettingType, SettingInputType, SettingMeta } from '../../../database/entities/setting.entity';

const SETTING_TYPES: SettingType[] = ['string', 'number', 'boolean', 'json', 'password'];
const INPUT_TYPES: SettingInputType[] = [
  'text', 'textarea', 'number', 'password', 'toggle',
  'checkbox', 'radio', 'select', 'color', 'url', 'email', 'date', 'image', 'stringArray',
];

export class SettingMetaOptionDto {
  @IsString()
  value: string;

  @IsString()
  label: string;
}

export class SettingMetaDto {
  @ApiPropertyOptional({ type: [SettingMetaOptionDto], description: 'Opciones para select, radio y checkbox' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingMetaOptionDto)
  @IsOptional()
  options?: SettingMetaOptionDto[];

  @ApiPropertyOptional({ description: 'Filas para textarea' })
  @IsInt()
  @Min(1)
  @IsOptional()
  rows?: number;

  @ApiPropertyOptional({ description: 'Valor mínimo para number' })
  @IsInt()
  @IsOptional()
  min?: number;

  @ApiPropertyOptional({ description: 'Valor máximo para number' })
  @IsInt()
  @IsOptional()
  max?: number;
}

export class CreateSettingDto {
  @ApiPropertyOptional({ description: 'ID de la categoría' })
  @IsInt()
  @Min(1)
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ example: 'app.name' })
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

  @ApiPropertyOptional({ enum: INPUT_TYPES, default: 'text' })
  @IsIn(INPUT_TYPES)
  @IsOptional()
  inputType?: SettingInputType;

  @ApiPropertyOptional({
    type: SettingMetaDto,
    description: 'select/radio/checkbox: { options }  |  textarea: { rows }  |  number: { min, max }',
  })
  @ValidateNested()
  @Type(() => SettingMetaDto)
  @IsOptional()
  meta?: SettingMeta | null;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
