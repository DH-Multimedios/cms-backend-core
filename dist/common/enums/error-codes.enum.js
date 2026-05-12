"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["USER_NOT_FOUND"] = "USER_NOT_FOUND";
    ErrorCode["USER_EMAIL_TAKEN"] = "USER_EMAIL_TAKEN";
    ErrorCode["USERNAME_TAKEN"] = "USERNAME_TAKEN";
    ErrorCode["USER_PROTECTED"] = "USER_PROTECTED";
    ErrorCode["ROLE_WEIGHT_EXCEEDED"] = "ROLE_WEIGHT_EXCEEDED";
    ErrorCode["ROLE_NOT_FOUND"] = "ROLE_NOT_FOUND";
    ErrorCode["ROLE_NAME_TAKEN"] = "ROLE_NAME_TAKEN";
    ErrorCode["ROLE_PROTECTED"] = "ROLE_PROTECTED";
    ErrorCode["PERMISSION_NOT_FOUND"] = "PERMISSION_NOT_FOUND";
    ErrorCode["TAXONOMY_NOT_FOUND"] = "TAXONOMY_NOT_FOUND";
    ErrorCode["TAXONOMY_SLUG_EXISTS"] = "TAXONOMY_SLUG_EXISTS";
    ErrorCode["TAXONOMY_HAS_CHILDREN"] = "TAXONOMY_HAS_CHILDREN";
    ErrorCode["TAXONOMY_INVALID_PARENT"] = "TAXONOMY_INVALID_PARENT";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=error-codes.enum.js.map