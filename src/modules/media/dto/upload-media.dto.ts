import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadMediaDto {
  @ApiProperty({
    description: 'Texto alternativo de la imagen (obligatorio para SEO/accesibilidad)',
    example: 'Logo de la empresa en fondo blanco',
  })
  @IsString()
  alt: string;

  @ApiPropertyOptional({
    description: 'Categoría de uso de la imagen (ej: logos, banners, products, avatars)',
    example: 'products',
  })
  @IsOptional()
  @IsString()
  usage?: string;
}
