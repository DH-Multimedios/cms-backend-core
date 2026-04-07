# Scripts de Desarrollo

Scripts para facilitar el desarrollo local del core.

## 📜 Scripts disponibles

### `start-dev.sh`

Inicia el entorno de desarrollo completo.

**Qué hace:**

1. Verifica que existe `.env`
2. Verifica si Podman está instalado
3. Verifica si el container de PostgreSQL existe
   - Si NO existe: lo crea con `podman-compose`
   - Si existe pero está parado: lo levanta
   - Si ya está corriendo: continúa
4. Espera a que PostgreSQL esté listo
5. Ejecuta migraciones
6. Opcionalmente ejecuta seeds (con flag `--seed`)
7. Inicia la aplicación en modo desarrollo

**Uso:**

```bash
pnpm start:dev         # Sin seeds
pnpm start:dev:seed    # Con seeds
```

---

### `stop-dev.sh`

Detiene el container de PostgreSQL (sin eliminarlo).

**Qué hace:**

- Para el container `backend-core-postgres`
- Los datos se mantienen en el volumen

**Uso:**

```bash
pnpm stop:dev
```

---

### `clean-dev.sh`

Elimina TODOS los containers y datos de desarrollo.

**⚠️ CUIDADO:** Esto borra la base de datos completa.

**Qué hace:**

1. Pide confirmación
2. Para el container
3. Elimina el container
4. Elimina los volúmenes (datos de PostgreSQL)

**Uso:**

```bash
pnpm clean:dev
```

---

## 🐘 Comandos de base de datos

```bash
# Levantar solo PostgreSQL
pnpm db:up

# Bajar PostgreSQL
pnpm db:down

# Ver logs de PostgreSQL
pnpm db:logs
```

---

## 🔄 Flujo de trabajo típico

### Primera vez

```bash
# 1. Copiar .env.example a .env y configurar
cp .env.example .env

# 2. Instalar dependencias
pnpm install

# 3. Iniciar con seeds (crea DB, migraciones, seeds)
pnpm start:dev:seed
```

### Desarrollo diario

```bash
# Iniciar desarrollo
pnpm start:dev

# Al terminar (opcional)
pnpm stop:dev
```

### Resetear base de datos

```bash
# Limpiar todo
pnpm clean:dev

# Volver a empezar con seeds
pnpm start:dev:seed
```

---

## 📝 Notas

- Los containers se crean con `restart: unless-stopped`
- Podés tener múltiples proyectos corriendo sin conflicto (puertos diferentes)
- Los datos persisten entre reinicios del sistema
- Solo `clean-dev.sh` elimina los datos
