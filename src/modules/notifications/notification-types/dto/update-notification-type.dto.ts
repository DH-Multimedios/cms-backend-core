import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateNotificationTypeDto } from './create-notification-type.dto';

export class UpdateNotificationTypeDto extends PartialType(CreateNotificationTypeDto) {
  @ApiPropertyOptional({ description: 'Toggle global — desactiva sin borrar' })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;
}
