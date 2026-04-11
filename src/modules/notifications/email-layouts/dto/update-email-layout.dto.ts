import { PartialType } from '@nestjs/swagger';
import { CreateEmailLayoutDto } from './create-email-layout.dto';

export class UpdateEmailLayoutDto extends PartialType(CreateEmailLayoutDto) {}
