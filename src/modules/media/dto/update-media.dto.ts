import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMediaDto {
  @ApiProperty({
    description: 'Texto alternativo de la imagen',
    example: 'Logo de la empresa actualizado',
  })
  @IsString()
  alt: string;
}
