import { IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertNotificationPreferenceDto {
  @ApiProperty({ example: 'user.welcome' })
  @IsString()
  notificationTypeKey: string;

  @ApiProperty()
  @IsBoolean()
  enabled: boolean;
}
