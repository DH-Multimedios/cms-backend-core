import { DataSource } from 'typeorm';
import { SettingCategory } from '../entities/setting-category.entity';
import { Setting } from '../entities/setting.entity';

const CATEGORIES = [
  {
    id: 1,
    slug: 'general',
    label: 'Configuración General',
    description: 'Ajustes globales de la aplicación',
    order: 0,
  },
  {
    id: 2,
    slug: 'email',
    label: 'Email',
    description: 'Configuración general de correo electrónico',
    order: 1,
  },
  {
    id: 3,
    slug: 'files-settings',
    label: 'Archivos',
    description: 'Configuración de gestión de archivos',
    order: 2,
  },
  {
    id: 4,
    slug: 'media-settings',
    label: 'Imágenes',
    description: 'Configuración de gestión de imágenes',
    order: 3,
  },
];

const SETTINGS: Array<{
  categoryKey: string;
  key: string;
  label: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'password';
  inputType?: string;
  order: number;
}> = [
  // ─── General ──────────────────────────────────────────────────────────────
  {
    categoryKey: 'general',
    key: 'app.name',
    label: 'Nombre de la aplicación',
    value: '',
    description: 'Nombre que se muestra en el dashboard y notificaciones',
    type: 'string',
    order: 1,
  },
  {
    categoryKey: 'general',
    key: 'app.url',
    label: 'URL de la aplicación',
    value: '',
    description: 'URL base del frontend (ej: https://miapp.com)',
    type: 'string',
    order: 2,
  },
  {
    categoryKey: 'general',
    key: 'app.logoUrl',
    label: 'URL del logo',
    value: '',
    description: 'URL pública del logo (se usa en emails, ej: https://miapp.com/logo.png)',
    type: 'string',
    inputType: 'url',
    order: 3,
  },
  // ─── Email ────────────────────────────────────────────────────────────────
  {
    categoryKey: 'email',
    key: 'email.from',
    label: 'Dirección remitente',
    value: '',
    description: 'Dirección de correo que aparece como remitente (ej: noreply@miapp.com)',
    type: 'string',
    order: 1,
  },
  // ─── Files ────────────────────────────────────────────────────────────────
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
    description: 'Lista de mimetypes permitidos para upload de archivos',
    type: 'json',
    inputType: 'stringArray',
    order: 1,
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
  },
  // ─── Media ────────────────────────────────────────────────────────────────
  {
    categoryKey: 'media-settings',
    key: 'media.allowedMimetypes',
    label: 'Tipos de imagen permitidos',
    value: JSON.stringify(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    description: 'Lista de mimetypes permitidos para upload de imágenes',
    type: 'json',
    inputType: 'stringArray',
    order: 1,
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
  },
];

export async function seedSettings(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(SettingCategory);
  const settingRepo = dataSource.getRepository(Setting);

  // Upsert categorías por key
  for (const cat of CATEGORIES) {
    const existing = await categoryRepo.findOneBy({ slug: cat.slug });
    if (!existing) {
      await categoryRepo.save(categoryRepo.create(cat));
      console.log(`  ✓ Categoría creada: ${cat.label}`);
    } else {
      console.log(`  – Categoría existente: ${cat.label}`);
    }
  }

  // Upsert settings por key
  for (const def of SETTINGS) {
    const existing = await settingRepo.findOneBy({ key: def.key });
    if (existing) {
      console.log(`  – Setting existente: ${def.key}`);
      continue;
    }

    const category = await categoryRepo.findOneBy({ slug: def.categoryKey });
    if (!category) {
      console.warn(
        `  ⚠ Categoría '${def.categoryKey}' no encontrada, saltando setting '${def.key}'`,
      );
      continue;
    }

    await settingRepo.save(
      settingRepo.create({
        categoryId: category.id,
        key: def.key,
        label: def.label,
        value: def.value,
        description: def.description,
        type: def.type,
        order: def.order,
      }),
    );
    console.log(`  ✓ Setting creado: ${def.key}`);
  }
}
