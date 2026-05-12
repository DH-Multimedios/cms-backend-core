"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCoreSeeds = runCoreSeeds;
const roles_seeder_1 = require("./roles.seeder");
const permissions_seeder_1 = require("./permissions.seeder");
const users_seeder_1 = require("./users.seeder");
const settings_seeder_1 = require("./settings.seeder");
const notifications_seeder_1 = require("./notifications.seeder");
async function runCoreSeeds(dataSource, options) {
    console.log('🌱 Iniciando seeds del core...\n');
    console.log('📝 Creando roles...');
    await (0, roles_seeder_1.seedRoles)(dataSource, options?.extraRoles);
    console.log('');
    console.log('📝 Creando permisos...');
    await (0, permissions_seeder_1.seedPermissions)(dataSource);
    console.log('');
    console.log('📝 Creando usuarios...');
    await (0, users_seeder_1.seedUsers)(dataSource);
    console.log('');
    console.log('📝 Creando settings...');
    await (0, settings_seeder_1.seedSettings)(dataSource);
    console.log('');
    console.log('📝 Creando notificaciones...');
    await (0, notifications_seeder_1.seedNotifications)(dataSource);
    console.log('');
    console.log('✅ Seeds del core completados!');
}
//# sourceMappingURL=core-seeds.js.map