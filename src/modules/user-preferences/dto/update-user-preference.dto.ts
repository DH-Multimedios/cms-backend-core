import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ThemePreference } from '../../../database/entities/user-preference.entity.js';

export class UpdateUserPreferenceDto {
  @ApiPropertyOptional({ enum: ['light', 'dark', 'system'] })
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  theme?: ThemePreference;
}
