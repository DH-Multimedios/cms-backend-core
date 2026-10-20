import {
  IsString,
  IsIn,
  IsOptional,
  IsEmail,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailProviderType } from '../../../database/entities/email-provider.entity.js';
import { SmtpConfigDto } from './smtp-config.dto.js';
import { ResendConfigDto } from './resend-config.dto.js';
import { GoogleOAuthConfigDto } from './google-oauth-config.dto.js';

const PROVIDER_TYPES: EmailProviderType[] = ['smtp', 'resend', 'google-oauth'];

export class CreateEmailProviderDto {
  @ApiProperty({ example: 'SMTP corporativo' })
  @IsString()
  name: string;

  @ApiProperty({ enum: PROVIDER_TYPES })
  @IsIn(PROVIDER_TYPES)
  provider: EmailProviderType;

  @ApiPropertyOptional({ example: 'noreply@miapp.com' })
  @IsEmail()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ type: SmtpConfigDto })
  @ValidateIf((o) => o.provider === 'smtp')
  @ValidateNested()
  @Type(() => SmtpConfigDto)
  smtp?: SmtpConfigDto;

  @ApiPropertyOptional({ type: ResendConfigDto })
  @ValidateIf((o) => o.provider === 'resend')
  @ValidateNested()
  @Type(() => ResendConfigDto)
  resend?: ResendConfigDto;

  @ApiPropertyOptional({ type: GoogleOAuthConfigDto })
  @ValidateIf((o) => o.provider === 'google-oauth')
  @ValidateNested()
  @Type(() => GoogleOAuthConfigDto)
  googleOAuth?: GoogleOAuthConfigDto;
}
