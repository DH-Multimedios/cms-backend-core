# Error codes — Guía para el frontend

Todos los errores del dominio siguen la misma estructura:

```json
{
  "statusCode": 409,
  "code": "USER_EMAIL_TAKEN",
  "message": "El email ya está en uso"
}
```

Usá `code` para manejar errores en el frontend — `message` es legible pero puede cambiar.

---

## Referencia completa

### Auth

| code | HTTP | Cuándo |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Email/username no existe o contraseña incorrecta |

---

### Users

| code | HTTP | Cuándo |
|---|---|---|
| `USER_NOT_FOUND` | 404 | Usuario no existe |
| `USER_EMAIL_TAKEN` | 409 | El email ya está registrado |
| `USERNAME_TAKEN` | 409 | El username ya está registrado |
| `USER_PROTECTED` | 403 | El usuario no se puede modificar ni eliminar |
| `ROLE_WEIGHT_EXCEEDED` | 403 | Intentás asignar un rol de mayor peso que el tuyo |

---

### Roles

| code | HTTP | Cuándo |
|---|---|---|
| `ROLE_NOT_FOUND` | 404 | Rol no existe |
| `ROLE_NAME_TAKEN` | 409 | Ya existe un rol con ese nombre |
| `ROLE_PROTECTED` | 403 | El rol no se puede modificar ni eliminar |

---

### Permissions

| code | HTTP | Cuándo |
|---|---|---|
| `PERMISSION_NOT_FOUND` | 404 | Permiso no existe |

---

### Taxonomies

| code | HTTP | Cuándo |
|---|---|---|
| `TAXONOMY_NOT_FOUND` | 404 | Taxonomía no existe |
| `TAXONOMY_SLUG_EXISTS` | 409 | El slug ya existe para ese tipo |
| `TAXONOMY_HAS_CHILDREN` | 409 | No se puede eliminar una taxonomía con hijos |
| `TAXONOMY_INVALID_PARENT` | 400 | El padre generaría un ciclo o es inválido |

---

### Genéricos

| code | HTTP | Cuándo |
|---|---|---|
| `FORBIDDEN` | 403 | Sin permisos para esta acción |
| `NOT_FOUND` | 404 | Recurso no encontrado (genérico) |
| `CONFLICT` | 409 | Conflicto de datos (genérico) |
| `VALIDATION_ERROR` | 400 | Campos inválidos — ver `message` para el detalle |
| `INTERNAL_ERROR` | 500 | Error inesperado del servidor |

---

## Manejo recomendado

```typescript
try {
  await apiFetch('/users', { method: 'POST', body: JSON.stringify(dto) });
} catch (err) {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'USER_EMAIL_TAKEN':
        setFieldError('email', 'Este email ya está en uso');
        break;
      case 'USERNAME_TAKEN':
        setFieldError('username', 'Este username ya está en uso');
        break;
      case 'VALIDATION_ERROR':
        // err.message contiene todos los errores separados por ';'
        showValidationErrors(err.message);
        break;
      case 'FORBIDDEN':
        showToast('No tenés permisos para esta acción');
        break;
      default:
        showToast('Ocurrió un error inesperado');
    }
  }
}
```

> Para errores de validación el `message` concatena todos los campos con `;`. Ver `00-overview.md` para parsearlo por campo.
