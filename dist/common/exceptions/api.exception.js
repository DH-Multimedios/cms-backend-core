"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiException = void 0;
const common_1 = require("@nestjs/common");
class ApiException extends common_1.HttpException {
    code;
    constructor(status, code, message) {
        super(message, status);
        this.code = code;
    }
}
exports.ApiException = ApiException;
//# sourceMappingURL=api.exception.js.map