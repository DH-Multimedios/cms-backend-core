# Settings — Guía para proyectos cliente

Cómo leer y gestionar configuración persistente desde módulos propios.

---

## Leer un setting en código

```typescript
import { Injectable } from '@nestjs/common';
import { SettingsService } from '@dh/backend-core';

@Injectable()
export class StoreService {
  constructor(private readonly settingsService: SettingsService) {}

  async getStoreName(): Promise<string> {
    return (await this.settingsService.getValue('app.name', 'Mi Tienda')) ?? 'Mi Tienda';
  }

  async getPaginationLimit(): Promise<number> {
    const value = await this.settingsService.getValue('pagination.limit', '20');
    return parseInt(value ?? '20', 10);
  }
}
```

---

## Seedear settings del cliente

Agregar categorías y settings específicos de tu proyecto en el seed:

```typescript
// src/database/seeds/client-settings.seeder.ts
import { DataSource } from 'typeorm';
import { SettingCategory, Setting } from '@dh/backend-core';

export async function seedClientSettings(dataSource: DataSource): Promise<void> {
  const categoryRepo = dataSource.getRepository(SettingCategory);
  const settingRepo = dataSource.getRepository(Setting);

  // Crear categoría propia
  let category = await categoryRepo.findOneBy({ slug: 'store' });
  if (!category) {
    category = await categoryRepo.save(
      categoryRepo.create({
        slug: 'store',
        label: 'Tienda',
        description: 'Configuración del ecommerce',
        order: 10,
      }),
    );
  }

  const defaults = [
    {
      key: 'store.currency',
      label: 'Moneda',
      value: 'ARS',
      type: 'string' as const,
      inputType: 'select' as const,
      meta: {
        options: [
          { value: 'ARS', label: 'Peso argentino' },
          { value: 'USD', label: 'Dólar' },
        ],
      },
      order: 1,
    },
    {
      key: 'store.taxRate',
      label: 'Tasa de IVA (%)',
      value: '21',
      type: 'number' as const,
      inputType: 'number' as const,
      meta: { min: 0, max: 100 },
      order: 2,
    },
    {
      key: 'store.freeShippingThreshold',
      label: 'Envío gratis desde ($)',
      value: '10000',
      type: 'number' as const,
      inputType: 'number' as const,
      meta: { min: 0 },
      order: 3,
    },
  ];

  for (const def of defaults) {
    const existing = await settingRepo.findOneBy({ key: def.key });
    if (!existing) {
      await settingRepo.save(
        settingRepo.create({ ...def, categoryId: category.id }),
      );
      console.log(`  ✓ Setting creado: ${def.key}`);
    }
  }
}
```

---

## Convención de keys

Usar prefijo del módulo para evitar colisiones con el core:

```
app.name          → core
app.url           → core
email.from        → core

store.currency    → cliente
store.taxRate     → cliente
orders.maxItems   → cliente
```

---

## Keys del core disponibles

| Key | Descripción | Tipo en DB | Default |
|-----|-------------|------------|---------|
| `app.name` | Nombre de la aplicación | `string` | — |
| `app.url` | URL del frontend | `string` | — |
| `app.logo` | URL del logo (para emails y dashboard) | `string` | — |
| `email.from` | Remitente de emails | `string` | — |
| `auth.sessionExpiration` | Duración de sesión en días | `number` | `365` |
| `files.allowedMimetypes` | Tipos de archivo permitidos (JSON array) | `json` | `['application/pdf', ...]` |
| `files.maxFileSize` | Tamaño máximo de archivo en bytes | `number` | `10485760` (10MB) |
| `media.allowedMimetypes` | Tipos de imagen permitidos (JSON array) | `json` | `['image/jpeg', ...]` |
| `media.maxFileSize` | Tamaño máximo de imagen en bytes | `number` | `5242880` (5MB) |

> ⚠️ El seed crea la key de logo como `app.logo`, pero `NotificationsService` la lee como `app.logoUrl`. Hay una inconsistencia en el core — hasta que se corrija, `{{appLogoUrl}}` no se inyecta en los templates. Si necesitás el logo en emails, guardalo en `app.logo` y reemplazalo manualmente en tu listener.
