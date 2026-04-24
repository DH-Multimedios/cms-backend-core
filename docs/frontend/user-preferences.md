# User Preferences — Guía para el frontend

Preferencias por usuario. No requieren permisos especiales — cualquier usuario autenticado puede leer y actualizar las suyas.

---

## Endpoints

### GET /user-preferences/me

Obtiene las preferencias del usuario autenticado. Si no existen, las crea con valores por defecto automáticamente.

**Auth:** Requiere sesión activa

**Response `200`:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "theme": "system",
    "createdAt": "2026-04-12T...",
    "updatedAt": "2026-04-12T..."
  }
}
```

---

### PATCH /user-preferences/me

Actualiza las preferencias del usuario autenticado. Todos los campos son opcionales.

**Auth:** Requiere sesión activa

**Request:**

```json
{
  "theme": "dark"
}
```

| Campo   | Tipo   | Valores                             | Descripción                                          |
| ------- | ------ | ----------------------------------- | ---------------------------------------------------- |
| `theme` | string | `"light"` \| `"dark"` \| `"system"` | Tema visual. `system` respeta la preferencia del SO. |

**Response `200`:** Preferencias actualizadas (mismo shape que GET, envuelto en `{ statusCode, data }`).

---

## Lógica de tema recomendada

El valor `system` indica que el frontend debe respetar `prefers-color-scheme` del sistema operativo. Implementación sugerida:

```typescript
function resolveTheme(preference: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (preference !== 'system') return preference;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
```

**Flujo recomendado al iniciar la app:**

1. Hacer `GET /user-preferences/me` al loguear
2. Aplicar `resolveTheme(preferences.theme)` antes de renderizar
3. Guardar en estado global para que los componentes reactiven
4. Al cambiar desde el perfil: `PATCH /user-preferences/me` + actualizar estado local sin recargar

---

## Valores por defecto

| Campo   | Default    | Razón                                         |
| ------- | ---------- | --------------------------------------------- |
| `theme` | `"system"` | Respeta la preferencia del SO sin forzar nada |
