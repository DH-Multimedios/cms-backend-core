import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleOAuthConfigDto {
  @ApiProperty({ example: '1234567890-abc.apps.googleusercontent.com' })
  @IsString()
  clientId: string;

  @ApiProperty({ example: 'GOCSPX-xxxxxxxxxx' })
  @IsString()
  clientSecret: string;

  @ApiProperty({ example: '1//0exxxxxxxxxxxxxxxxxx' })
  @IsString()
  refreshToken: string;

  @ApiProperty({ example: 'miapp@gmail.com' })
  @IsEmail()
  user: string;
}
