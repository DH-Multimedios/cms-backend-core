"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = void 0;
class UserResponseDto {
    id;
    email;
    username;
    firstName;
    lastName;
    isActive;
    isSystemUser;
    isProtected;
    avatarUrl;
    roles;
    lastLoginAt;
    createdAt;
    updatedAt;
    static from(user) {
        const dto = new UserResponseDto();
        dto.id = user.id;
        dto.email = user.email;
        dto.username = user.username;
        dto.firstName = user.firstName;
        dto.lastName = user.lastName;
        dto.isActive = user.isActive;
        dto.isSystemUser = user.isSystemUser;
        dto.isProtected = user.isProtected;
        dto.avatarUrl = user.avatarUrl;
        dto.roles = (user.roles || []).map((r) => ({ id: r.id, name: r.name, label: r.label, weight: r.weight }));
        dto.lastLoginAt = user.lastLoginAt;
        dto.createdAt = user.createdAt;
        dto.updatedAt = user.updatedAt;
        return dto;
    }
}
exports.UserResponseDto = UserResponseDto;
//# sourceMappingURL=user-response.dto.js.map