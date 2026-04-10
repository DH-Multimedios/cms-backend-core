import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendConfigDto {
  @ApiProperty({ example: 're_xxxxxxxxxxxxxxxx' })
  @IsString()
  apiKey: string;
}
