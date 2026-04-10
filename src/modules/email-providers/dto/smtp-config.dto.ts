import { IsString, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SmtpConfigDto {
  @ApiProperty({ example: 'smtp.gmail.com' })
  @IsString()
  host: string;

  @ApiProperty({ example: 587 })
  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @ApiProperty({ example: 'usuario@gmail.com' })
  @IsString()
  user: string;

  @ApiProperty({ example: 'mi-contraseña' })
  @IsString()
  pass: string;

  @ApiProperty({ example: false, description: 'true para port 465 (SSL), false para STARTTLS' })
  @IsBoolean()
  secure: boolean;
}
