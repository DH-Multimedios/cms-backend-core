"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPasswordResetRequestedEvent = void 0;
class UserPasswordResetRequestedEvent {
    user;
    resetToken;
    constructor(user, resetToken) {
        this.user = user;
        this.resetToken = resetToken;
    }
}
exports.UserPasswordResetRequestedEvent = UserPasswordResetRequestedEvent;
//# sourceMappingURL=user-password-reset-requested.event.js.map