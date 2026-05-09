# Reutilizar exports del core en el proyecto cliente

Sí, el proyecto cliente puede reutilizar varios exports de `@dh/backend-core` además de los módulos principales.

La idea NO es acoplarse a cualquier cosa que el paquete exporte porque sí. La regla correcta es reutilizar lo que ya es transversal, estable y aporta consistencia entre proyectos.

## Qué conviene reutilizar

### Paginación

- `PaginationDto`
- `PaginatedResult`

Conviene usarlos cuando el cliente necesita endpoints paginados con la misma forma que el core.

## Helpers y utilidades

- `generateSlug`

Sirve para mantener la misma lógica base cuando el cliente necesita generar slugs compatibles con el comportamiento del core.

## Errores y respuestas

- `ApiException`
- `ErrorCode`
- `ApiResponse`

Esto ayuda a mantener consistencia en manejo de errores y contrato de respuesta.

## Auth y permisos

- `CurrentUser`
- `RequirePermissions`
- `Public`
- `SessionAuthGuard`
- `PermissionsGuard`
- `LocalAuthGuard`

Conviene reutilizarlos cuando el proyecto cliente expone endpoints propios pero quiere integrarse con el mismo modelo de autenticación y autorización del core.

## Entidades y tipos

También se exportan entidades y tipos que pueden servir para evitar duplicación cuando el cliente extiende funcionalidades existentes.

## Cuándo reutilizar

Reutilizar cuando:

- ya existe un contrato común en el core,
- el comportamiento debe mantenerse consistente,
- la abstracción es genérica y no depende de detalles internos del módulo.

## Cuándo NO reutilizar

No reutilizar solo porque está exportado.

Evitá apoyarte en piezas demasiado internas o muy atadas a una implementación puntual del core, porque eso mete acoplamiento innecesario y después encarece cambios.

## Regla práctica

Si algo del core resuelve una preocupación transversal, por ejemplo paginación, slugs, errores o permisos, conviene reutilizarlo.

Si algo pertenece a una necesidad específica de negocio del cliente, conviene modelarlo en el cliente.

## Ejemplo

```ts
import { PaginationDto, generateSlug, ApiException, ErrorCode } from '@dh/backend-core';
import type { PaginatedResult } from '@dh/backend-core';
```

## Resumen

Sí, hay que avisarle al cliente que puede reutilizar helpers y utilidades del core, especialmente paginación, errores, auth y helpers genéricos.

Pero hay que comunicarlo con criterio: reutilizar lo estable y transversal, no acoplarse a cualquier export interno.
