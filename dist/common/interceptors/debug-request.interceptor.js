"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugRequestInterceptor = void 0;
const common_1 = require("@nestjs/common");
let DebugRequestInterceptor = class DebugRequestInterceptor {
    logger = new common_1.Logger('DebugRequest');
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        this.logger.debug(`${req.method} ${req.path} | query: ${JSON.stringify(req.query)} | body: ${JSON.stringify(req.body)}`);
        return next.handle();
    }
};
exports.DebugRequestInterceptor = DebugRequestInterceptor;
exports.DebugRequestInterceptor = DebugRequestInterceptor = __decorate([
    (0, common_1.Injectable)()
], DebugRequestInterceptor);
//# sourceMappingURL=debug-request.interceptor.js.map