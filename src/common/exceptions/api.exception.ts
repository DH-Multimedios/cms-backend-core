import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-codes.enum';

export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly code: ErrorCode | string,
    message: string,
  ) {
    super(message, status);
  }
}
