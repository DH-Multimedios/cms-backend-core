# Cambio de modelo en roles

Este cambio separa la clave técnica del texto visible.

- `name`: identificador interno, estable, en `snake_case`
- `label`: texto visible para UI

Ejemplo:

```json
{
  "name": "super_admin",
  "label": "Super Admin"
}
```

## Qué cambió

1. Los roles core dejaron de usar nombres tipo `SuperAdmin` y pasan a `snake_case`.
2. Se agregó `label` como campo obligatorio en roles.
3. Los seeds y lookups internos ahora usan `name` técnico.
4. La búsqueda de roles contempla `name` o `label`.

## Roles core actuales

| Antes | Ahora (`name`) | `label` |
| --- | --- | --- |
| `SuperAdmin` | `super_admin` | `Super Admin` |
| `Admin` | `admin` | `Admin` |
| `User` | `user` | `Usuario` |

## Regla de uso

| Campo | Uso correcto |
| --- | --- |
| `name` | Seeds, comparaciones, claves internas, integraciones, lookups |
| `label` | Selects, tablas, formularios, chips, texto visible |

## Impacto técnico

### Base de datos

- `roles` ahora tiene columna `label` obligatoria.
- El baseline ya contempla `label`.
- Se agregó migración `1733500000101-AddRoleLabelAndSnakeCaseName.ts`.

### Seeds

Se actualizaron los seeds core para usar:

- `super_admin`
- `admin`
- `user`

También se actualizó el contrato público `ExtraRole` para requerir:

```ts
{
  name: string
  label: string
}
```

## Impacto en API

### Crear rol

Ahora `POST /roles` debe enviar `name` en `snake_case` y `label`.

```json
{
  "name": "content_editor",
  "label": "Editor de contenido",
  "description": "Puede editar contenido",
  "weight": 50
}
```

### Actualizar rol

`PATCH /roles/:id` acepta cambios en `name` y `label`.

### Listados

- `GET /roles/list` incluye `label`
- `GET /roles` permite buscar por `name` o `label`

## Qué tiene que hacer el frontend

1. Mostrar `label` como texto principal.
2. Usar `name` solo si necesita una clave técnica.
3. En formularios, pedir ambos campos.
4. En búsquedas, asumir que backend ya busca por `name` o `label`.

## Qué tienen que hacer integraciones o clientes

Si usan `runCoreSeeds({ extraRoles })`, cada rol extra ahora debe incluir `label`.

Ejemplo:

```ts
extraRoles: [
  {
    name: 'area_manager',
    label: 'Gerente de área',
    description: 'Gestiona un área específica',
    weight: 70,
  },
]
```

## Validación aplicada

- `name` debe respetar `snake_case`
- formato permitido: `^[a-z][a-z0-9_]*$`

Ejemplos válidos:

- `admin`
- `super_admin`
- `content_editor_2`

Ejemplos inválidos:

- `SuperAdmin`
- `super-admin`
- `Gerente de área`

## Archivos tocados

- `src/database/entities/role.entity.ts`
- `src/database/migrations/1733500000100-BaselineSchema.ts`
- `src/database/migrations/1733500000101-AddRoleLabelAndSnakeCaseName.ts`
- `src/database/seeds/roles.seeder.ts`
- `src/database/seeds/permissions.seeder.ts`
- `src/database/seeds/users.seeder.ts`
- `src/database/seeds/core-seeds.ts`
- `src/modules/roles/dto/create-role.dto.ts`
- `src/modules/roles/dto/update-role.dto.ts`
- `src/modules/roles/dto/roles-query.dto.ts`
- `src/modules/roles/roles.service.ts`
- `src/modules/roles/roles.service.spec.ts`

## Verificación

- `pnpm exec jest "roles.service"` ✅
- `pnpm exec tsc --noEmit` ✅ sin errores nuevos, quedaron 3 errores preexistentes en `users.service.spec.ts`
