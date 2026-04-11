import { IsString, IsIn, IsArray, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailLayoutType } from '../../../../database/entities/email-layout.entity';
import { Section } from '../../../../database/entities/notification-block.types';

const LAYOUT_TYPES: EmailLayoutType[] = ['header', 'footer'];

export class CreateEmailLayoutDto {
  @ApiProperty({ enum: LAYOUT_TYPES })
  @IsIn(LAYOUT_TYPES)
  type: EmailLayoutType;

  @ApiProperty({ example: 'Header corporativo' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Array de secciones con columnas y bloques' })
  @IsArray()
  sections: Section[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
