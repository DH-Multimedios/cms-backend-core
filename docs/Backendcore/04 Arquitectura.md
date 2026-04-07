## 🧠 Enfoque general

Arquitectura modular basada en NestJS, donde cada funcionalidad del core se implementa como un módulo independiente, desacoplado de la lógica de negocio y reutilizable en múltiples proyectos.

---

## 🧩 Organización por módulos

El core se compone de módulos autónomos:

- Auth
    
- Users
    
- Roles
    
- Audit
    
- Taxonomies
    
- Files
    
- Media
    
- Settings
    
- Notifications
    

Cada módulo:

- encapsula su lógica
    
- expone servicios claros
    
- evita dependencias innecesarias
    

---

## 🔗 Relación entre módulos

Se permite **acoplamiento controlado dentro del core** cuando aporta simplicidad.

Ejemplo:

- `Auth → Users`
    
- `Users → Roles`
    
- `Taxonomies → Media` (para resolver imágenes)
    

Regla:

> El acoplamiento es válido si simplifica el uso y no introduce lógica de negocio.

---

## 🚫 Restricción para módulos de negocio

Los módulos del cliente (ej: Products, Posts):

- pueden depender de `Users`
    
- no deben depender de `Roles` ni `Auth` directamente
    
- consumen funcionalidades mediante servicios del core
    

---

## 🔄 Comunicación

Se combinan dos enfoques:

- **Llamadas directas** para operaciones simples
    
- **Eventos (emitters)** para acciones transversales (ej: auditoría, notificaciones)
    

---

## 🗂️ Modelo de datos

### Entidades por módulo

Cada módulo define sus propias entidades sin acoplarse a otras innecesariamente.

---

### Taxonomías

- Entidad global `Taxonomy`
    
- Tipos definidos por campo `type` (category, tag, etc.)
    
- Relaciones específicas por módulo (ej: `post_categories`, `product_categories`)
    

---

### Files y Media

- Módulos independientes
    
- CRUD propio en cada uno
    
- Sin dependencia entre ellos
    

---

## 🧠 Resolución de datos (composición)

La lógica de composición se centraliza en el core.

Ejemplo:

- `TaxonomyService` puede devolver taxonomías con o sin imagen
    
- Uso de parámetros (ej: `includeImage`) para controlar comportamiento
    

Esto evita duplicación en los módulos del cliente.

---

## ⚙️ Configuración

El core se inicializa mediante configuración centralizada:

```id="config"
CoreModule.register(config)
```

Permite:

- configurar módulos
    
- habilitar/deshabilitar features
    
- definir comportamientos globales
    

---

## 🔐 Seguridad

- Control de acceso basado en permisos
    
- Roles como agrupadores de permisos
    
- Sistema de peso para jerarquía y bypass controlado
    
- Flags de protección (`isProtected`) para entidades críticas
    

---

## 🔌 Extensibilidad

El diseño permite:

- sobrescribir servicios mediante DI
    
- agregar nuevos módulos sin modificar el core
    
- extender funcionalidades desde cada proyecto
    

---
## 🗄️ **Capa de persistencia (base del sistema)**

- El core incluye la configuración de base de datos (PostgreSQL + TypeORM)
- Todos los módulos comparten la misma conexión
- Cada módulo define sus propias entidades
- El core provee las entidades base (users, roles, etc.)

👉 Esto deja claro que:

- la DB es parte del core
- no es opcional
---
## 🎯 Principios clave

- Modularidad
    
- Simplicidad
    
- Bajo acoplamiento
    
- Reutilización
    
- Extensibilidad
    

---

## 🚀 Resultado esperado

Una arquitectura:

- fácil de entender por el equipo
    
- rápida de implementar en nuevos proyectos
    
- mantenible a largo plazo
    
- preparada para crecer sin refactorizaciones profundas