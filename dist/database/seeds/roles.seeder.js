"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRoles = seedRoles;
const role_entity_1 = require("../entities/role.entity");
const CORE_ROLES = [
    {
        name: 'super_admin',
        label: 'Super Admin',
        description: 'Super administrador del sistema con todos los permisos',
        weight: 100,
        isProtected: true,
    },
    {
        name: 'admin',
        label: 'Admin',
        description: 'Administrador con permisos limitados',
        weight: 90,
        isProtected: true,
    },
    {
        name: 'user',
        label: 'Usuario',
        description: 'Usuario estándar con permisos básicos',
        weight: 50,
        isProtected: true,
    },
];
async function seedRoles(dataSource, extraRoles) {
    const roleRepository = dataSource.getRepository(role_entity_1.Role);
    const roles = [
        ...CORE_ROLES,
        ...(extraRoles ?? []),
    ];
    for (const roleData of roles) {
        const exists = await roleRepository.findOne({ where: { name: roleData.name } });
        if (!exists) {
            const role = roleRepository.create(roleData);
            await roleRepository.save(role);
            console.log(`✅ Rol creado: ${roleData.name} (${roleData.label})`);
        }
        else {
            console.log(`⏭️  Rol ya existe: ${roleData.name}`);
        }
    }
}
//# sourceMappingURL=roles.seeder.js.map