import { DataSource } from 'typeorm';
import { SettingCategory } from '../entities/setting-category.entity';
import { Setting } from '../entities/setting.entity';

const CATEGORIES = [
  { id: 1, key: 'general', label: 'Configuración General', description: 'Ajustes globales de la aplicación', order: 1 },
  { id: 2, key: 'email', label: 'Email', description: 'Configuración general de correo electrónico', order: 2 },
];

const SETTINGS: Array<{
  categoryKey: string;
  key: string;
  label: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'password';
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
];

export async function seedSettings(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(SettingCategory);
  const settingRepo = dataSource.getRepository(Setting);

  // Upsert categorías por key
  for (const cat of CATEGORIES) {
    const existing = await categoryRepo.findOneBy({ key: cat.key });
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

    const category = await categoryRepo.findOneBy({ key: def.categoryKey });
    if (!category) {
      console.warn(`  ⚠ Categoría '${def.categoryKey}' no encontrada, saltando setting '${def.key}'`);
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
