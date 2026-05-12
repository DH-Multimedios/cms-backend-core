"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAnyPermission = exports.RequirePermissions = exports.PERMISSIONS_ANY_KEY = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'permissions';
exports.PERMISSIONS_ANY_KEY = 'permissions_any';
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
const RequireAnyPermission = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_ANY_KEY, permissions);
exports.RequireAnyPermission = RequireAnyPermission;
//# sourceMappingURL=require-permissions.decorator.js.map