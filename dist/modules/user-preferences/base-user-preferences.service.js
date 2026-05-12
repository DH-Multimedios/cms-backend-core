"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseUserPreferencesService = void 0;
class BaseUserPreferencesService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async findOrCreate(userId, defaults = {}) {
        const existing = await this.repository.findOneBy({ userId });
        if (existing)
            return existing;
        const created = this.repository.create({ userId, ...defaults });
        return (await this.repository.save(created));
    }
    async update(userId, dto) {
        const existing = await this.repository.findOneBy({ userId });
        const preference = existing ?? this.repository.create({ userId });
        Object.assign(preference, dto);
        return (await this.repository.save(preference));
    }
}
exports.BaseUserPreferencesService = BaseUserPreferencesService;
//# sourceMappingURL=base-user-preferences.service.js.map