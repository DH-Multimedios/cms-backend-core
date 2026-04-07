Descripción clara para el repo/package:

---

# 📦 `@dh/backend-core`

Base reutilizable para construir APIs con NestJS enfocada en autenticación, usuarios, roles y funcionalidades comunes entre múltiples proyectos.

---

## 🧩 Descripción corta

Core modular para APIs en NestJS que centraliza autenticación, gestión de usuarios, roles, auditoría y utilidades comunes, diseñado para ser reutilizado y extendido en múltiples aplicaciones.

---

## 🧱 Descripción más completa

`@dh/backend-core` es una librería basada en NestJS que provee una base sólida y reutilizable para el desarrollo de APIs. Incluye módulos esenciales como autenticación, usuarios, roles, auditoría y health checks, desacoplados de cualquier lógica de negocio específica.

Está pensada para ser utilizada como dependencia en distintos proyectos, permitiendo mantener consistencia, reducir duplicación de código y acelerar el desarrollo. Cada aplicación puede extender o sobrescribir comportamientos del core sin modificar su código base.

---

## 🎯 Objetivo

- Reutilizar lógica común entre proyectos
    
- Evitar duplicación de código
    
- Mantener consistencia arquitectónica
    
- Facilitar escalabilidad y mantenimiento
    

---

## 🧠 Enfoque

- Modular (NestJS modules)
    
- Extensible (override de providers)
    
- Configurable (`register()`)
    
- Independiente del negocio
    