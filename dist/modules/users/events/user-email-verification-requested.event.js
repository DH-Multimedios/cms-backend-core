"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEmailVerificationRequestedEvent = void 0;
class UserEmailVerificationRequestedEvent {
    user;
    verificationToken;
    constructor(user, verificationToken) {
        this.user = user;
        this.verificationToken = verificationToken;
    }
}
exports.UserEmailVerificationRequestedEvent = UserEmailVerificationRequestedEvent;
//# sourceMappingURL=user-email-verification-requested.event.js.map