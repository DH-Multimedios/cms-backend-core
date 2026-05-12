"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../exceptions/api.exception");
const error_codes_enum_1 = require("../enums/error-codes.enum");
const STATUS_CODE_MAP = {
    [common_1.HttpStatus.BAD_REQUEST]: error_codes_enum_1.ErrorCode.VALIDATION_ERROR,
    [common_1.HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
    [common_1.HttpStatus.FORBIDDEN]: error_codes_enum_1.ErrorCode.FORBIDDEN,
    [common_1.HttpStatus.NOT_FOUND]: error_codes_enum_1.ErrorCode.NOT_FOUND,
    [common_1.HttpStatus.CONFLICT]: error_codes_enum_1.ErrorCode.CONFLICT,
};
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (exception instanceof api_exception_1.ApiException) {
            response.status(exception.getStatus()).json({
                statusCode: exception.getStatus(),
                code: exception.code,
                message: exception.message,
            });
            return;
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const exResponse = exception.getResponse();
            const rawMessage = typeof exResponse === 'object' && exResponse !== null
                ? exResponse.message
                : exResponse;
            const message = Array.isArray(rawMessage)
                ? rawMessage.join('; ')
                : typeof rawMessage === 'string'
                    ? rawMessage
                    : exception.message;
            const code = STATUS_CODE_MAP[status] ?? 'HTTP_ERROR';
            response.status(status).json({ statusCode: status, code, message });
            return;
        }
        console.error('[HttpExceptionFilter] Unhandled exception:', exception);
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            code: error_codes_enum_1.ErrorCode.INTERNAL_ERROR,
            message: 'Internal server error',
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map