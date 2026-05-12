"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSettings = seedSettings;
const setting_category_entity_1 = require("../entities/setting-category.entity");
const setting_entity_1 = require("../entities/setting.entity");
const CATEGORIES = [
    {
        id: 1,
        slug: 'general',
        label: 'Configuración General',
        description: 'Ajustes globales de la aplicación',
        order: 0,
        isProtected: true,
    },
    {
        id: 2,
        slug: 'email',
        label: 'Email',
        description: 'Configuración general de correo electrónico',
        order: 1,
        isProtected: true,
    },
    {
        id: 3,
        slug: 'files-settings',
        label: 'Archivos',
        description: 'Configuración de gestión de archivos',
        order: 2,
        isProtected: true,
    },
    {
        id: 4,
        slug: 'media-settings',
        label: 'Imágenes',
        description: 'Configuración de gestión de imágenes',
        order: 3,
        isProtected: true,
    },
    {
        id: 5,
        slug: 'auth',
        label: 'Autenticación',
        description: 'Configuración de sesiones y seguridad',
        order: 4,
        isProtected: true,
    },
];
const SETTINGS = [
    {
        categoryKey: 'general',
        key: 'app.name',
        label: 'Nombre de la aplicación',
        value: '',
        description: 'Nombre que se muestra en el dashboard y notificaciones',
        type: 'string',
        order: 1,
        isProtected: true,
    },
    {
        categoryKey: 'general',
        key: 'app.url',
        label: 'URL de la aplicación',
        value: '',
        description: 'URL base del frontend (ej: https://miapp.com)',
        type: 'string',
        inputType: 'url',
        order: 2,
        isProtected: true,
    },
    {
        categoryKey: 'general',
        key: 'app.logo',
        label: 'Logo',
        value: '',
        description: 'Logo del sitio (se usa en emails y dashboard)',
        type: 'string',
        inputType: 'image',
        order: 3,
        isProtected: true,
    },
    {
        categoryKey: 'email',
        key: 'email.from',
        label: 'Dirección remitente',
        value: '',
        description: 'Dirección de correo que aparece como remitente (ej: noreply@miapp.com)',
        type: 'string',
        order: 1,
        isProtected: true,
    },
    {
        categoryKey: 'files-settings',
        key: 'files.allowedMimetypes',
        label: 'Tipos de archivo permitidos',
        value: JSON.stringify([
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
        ]),
        description: 'Formatos habilitados para upload de archivos. Destildá los que no querés aceptar.',
        type: 'json',
        inputType: 'checkbox',
        meta: {
            options: [
                { value: 'application/pdf', label: 'PDF' },
                { value: 'application/msword', label: 'Word (.doc)' },
                { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word (.docx)' },
                { value: 'application/vnd.ms-excel', label: 'Excel (.xls)' },
                { value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel (.xlsx)' },
                { value: 'text/plain', label: 'Texto (.txt)' },
                { value: 'text/csv', label: 'CSV' },
            ],
        },
        order: 1,
        isProtected: true,
    },
    {
        categoryKey: 'files-settings',
        key: 'files.maxFileSize',
        label: 'Tamaño máximo de archivo',
        value: '10485760',
        description: 'Tamaño máximo permitido para uploads en bytes (10485760 = 10MB)',
        type: 'number',
        inputType: 'number',
        order: 2,
        isProtected: true,
    },
    {
        categoryKey: 'media-settings',
        key: 'media.allowedMimetypes',
        label: 'Tipos de imagen permitidos',
        value: JSON.stringify(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
        description: 'Formatos habilitados para upload de imágenes. Destildá los que no querés aceptar.',
        type: 'json',
        inputType: 'checkbox',
        meta: {
            options: [
                { value: 'image/jpeg', label: 'JPEG' },
                { value: 'image/png', label: 'PNG' },
                { value: 'image/webp', label: 'WebP' },
                { value: 'image/gif', label: 'GIF' },
            ],
        },
        order: 1,
        isProtected: true,
    },
    {
        categoryKey: 'media-settings',
        key: 'media.maxFileSize',
        label: 'Tamaño máximo de imagen',
        value: '5242880',
        description: 'Tamaño máximo permitido para imágenes en bytes (5242880 = 5MB)',
        type: 'number',
        inputType: 'number',
        order: 2,
        isProtected: true,
    },
    {
        categoryKey: 'auth',
        key: 'auth.sessionExpiration',
        label: 'Duración de sesión (días)',
        value: '365',
        description: 'Cantidad de días que una sesión permanece activa. Default: 365 (1 año).',
        type: 'number',
        inputType: 'number',
        order: 1,
        isProtected: true,
    },
];
async function seedSettings(dataSource) {
    const categoryRepo = dataSource.getRepository(setting_category_entity_1.SettingCategory);
    const settingRepo = dataSource.getRepository(setting_entity_1.Setting);
    for (const cat of CATEGORIES) {
        const existing = await categoryRepo.findOneBy({ slug: cat.slug });
        if (!existing) {
            await categoryRepo.save(categoryRepo.create(cat));
            console.log(`  ✓ Categoría creada: ${cat.label}`);
        }
        else if (existing.isProtected !== cat.isProtected) {
            await categoryRepo.save({ ...existing, isProtected: cat.isProtected });
            console.log(`  ↺ Categoría actualizada: ${cat.label}`);
        }
        else {
            console.log(`  – Categoría existente: ${cat.label}`);
        }
    }
    for (const def of SETTINGS) {
        const existing = await settingRepo.findOneBy({ key: def.key });
        if (existing) {
            if (existing.isProtected !== (def.isProtected ?? false)) {
                await settingRepo.save({ ...existing, isProtected: def.isProtected ?? false });
                console.log(`  ↺ Setting actualizado: ${def.key}`);
            }
            else {
                console.log(`  – Setting existente: ${def.key}`);
            }
            continue;
        }
        const category = await categoryRepo.findOneBy({ slug: def.categoryKey });
        if (!category) {
            console.warn(`  ⚠ Categoría '${def.categoryKey}' no encontrada, saltando setting '${def.key}'`);
            continue;
        }
        await settingRepo.save(settingRepo.create({
            categoryId: category.id,
            key: def.key,
            label: def.label,
            value: def.value,
            description: def.description,
            type: def.type,
            inputType: def.inputType ?? 'text',
            meta: def.meta ?? null,
            order: def.order,
            isProtected: def.isProtected ?? false,
        }));
        console.log(`  ✓ Setting creado: ${def.key}`);
    }
}
//# sourceMappingURL=settings.seeder.js.map