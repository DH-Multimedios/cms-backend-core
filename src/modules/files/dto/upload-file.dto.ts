import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'ID del usuario dueño del archivo (si no se envía, es el usuario que sube)',
  })
  @IsOptional()
  @IsUUID()
  fileOwnerUserId?: string;

  @ApiProperty({ description: 'Categoría de uso del archivo (ej: contracts, invoices, reports)' })
  @IsString()
  usage: string;

  @ApiPropertyOptional({
    description: 'Nombre descriptivo del archivo',
    example: 'Contrato de servicios 2024',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Descripción del archivo' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Si el archivo es público (descargable sin autenticación)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
