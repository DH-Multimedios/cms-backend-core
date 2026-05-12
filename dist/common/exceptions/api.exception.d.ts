import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../enums/error-codes.enum';
export declare class ApiException extends HttpException {
    readonly code: ErrorCode | string;
    constructor(status: HttpStatus, code: ErrorCode | string, message: string);
}
//# sourceMappingURL=api.exception.d.ts.map