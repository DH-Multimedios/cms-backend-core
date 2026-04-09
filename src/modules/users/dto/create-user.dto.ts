import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsArray, IsUUID, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'johndoe', minLength: 3, maxLength: 15 })
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'El username solo puede contener letras y números' })
  @IsOptional()
  username?: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ type: [String], description: 'IDs de roles a asignar' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  roleIds?: string[];
}
