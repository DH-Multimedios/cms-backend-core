import { PartialType } from '@nestjs/swagger';
import { CreateEmailProviderDto } from './create-email-provider.dto.js';

export class UpdateEmailProviderDto extends PartialType(CreateEmailProviderDto) {}
