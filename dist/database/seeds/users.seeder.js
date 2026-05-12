"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
async function seedUsers(dataSource) {
    const userRepository = dataSource.getRepository(user_entity_1.User);
    const roleRepository = dataSource.getRepository(role_entity_1.Role);
    const systemUserEmail = process.env.SYSTEM_USER_EMAIL;
    const systemUserPassword = process.env.SYSTEM_USER_PASSWORD;
    if (!systemUserEmail || !systemUserPassword) {
        console.warn('⚠️  SYSTEM_USER_EMAIL o SYSTEM_USER_PASSWORD no definidos. Usuario del sistema NO creado.');
    }
    else {
        const existingSystemUsers = await userRepository.count({ where: { isSystemUser: true } });
        if (existingSystemUsers > 0) {
            console.log('⏭️  Usuario del sistema ya existe');
        }
        else {
            const hashedPassword = await bcrypt.hash(systemUserPassword, 10);
            const systemUser = userRepository.create({
                email: systemUserEmail,
                username: 'system',
                password: hashedPassword,
                firstName: 'System',
                lastName: 'User',
                isSystemUser: true,
                isProtected: true,
                isActive: true,
            });
            await userRepository.save(systemUser);
            console.log(`✅ Usuario del sistema creado: ${systemUserEmail}`);
        }
    }
    const superAdminEmail = process.env.SUPERADMIN_EMAIL;
    const superAdminPassword = process.env.SUPERADMIN_PASSWORD;
    if (!superAdminEmail || !superAdminPassword) {
        console.warn('⚠️  SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD no definidos. SuperAdmin NO creado.');
    }
    else {
        let superAdmin = await userRepository.findOne({
            where: { email: superAdminEmail },
            relations: ['roles'],
        });
        if (!superAdmin) {
            const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
            const superAdminRole = await roleRepository.findOne({ where: { name: 'super_admin' } });
            superAdmin = userRepository.create({
                email: superAdminEmail,
                username: 'superadmin',
                password: hashedPassword,
                firstName: 'Super',
                lastName: 'Admin',
                isProtected: true,
                isActive: true,
                roles: superAdminRole ? [superAdminRole] : [],
            });
            await userRepository.save(superAdmin);
            console.log(`✅ SuperAdmin creado: ${superAdminEmail}`);
        }
        else {
            console.log(`⏭️  SuperAdmin ya existe: ${superAdminEmail}`);
        }
    }
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
        let admin = await userRepository.findOne({
            where: { email: adminEmail },
            relations: ['roles'],
        });
        if (!admin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const adminRole = await roleRepository.findOne({ where: { name: 'admin' } });
            admin = userRepository.create({
                email: adminEmail,
                username: 'admin',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                isProtected: false,
                isActive: true,
                roles: adminRole ? [adminRole] : [],
            });
            await userRepository.save(admin);
            console.log(`✅ Admin creado: ${adminEmail}`);
        }
        else {
            console.log(`⏭️  Admin ya existe: ${adminEmail}`);
        }
    }
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;
    if (userEmail && userPassword) {
        let user = await userRepository.findOne({
            where: { email: userEmail },
            relations: ['roles'],
        });
        if (!user) {
            const hashedPassword = await bcrypt.hash(userPassword, 10);
            const userRole = await roleRepository.findOne({ where: { name: 'user' } });
            user = userRepository.create({
                email: userEmail,
                username: 'user',
                password: hashedPassword,
                firstName: 'User',
                lastName: 'User',
                isProtected: false,
                isActive: true,
                roles: userRole ? [userRole] : [],
            });
            await userRepository.save(user);
            console.log(`✅ Usuario normal creado: ${userEmail}`);
        }
        else {
            console.log(`⏭️  Usuario normal ya existe: ${userEmail}`);
        }
    }
}
//# sourceMappingURL=users.seeder.js.map