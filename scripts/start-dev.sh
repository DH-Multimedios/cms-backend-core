#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Backend Core - Desarrollo${NC}\n"

# Verificar que existe .env
if [ ! -f .env ]; then
  echo -e "${RED}❌ Archivo .env no encontrado${NC}"
  echo -e "${YELLOW}Copiando .env.example a .env...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✅ .env creado. Por favor configurá tus variables de entorno.${NC}"
  exit 1
fi

# Cargar variables de entorno
export $(cat .env | grep -v '^#' | xargs)

# Nombre del container
CONTAINER_NAME="backend-core-postgres"

# Verificar si podman está instalado
if ! command -v podman &> /dev/null; then
  echo -e "${RED}❌ Podman no está instalado${NC}"
  echo -e "${YELLOW}Instalá Podman: https://podman.io/getting-started/installation${NC}"
  exit 1
fi

# Verificar si podman-compose está instalado
if ! command -v podman-compose &> /dev/null; then
  echo -e "${RED}❌ podman-compose no está instalado${NC}"
  echo -e "${YELLOW}Instalá podman-compose: pip3 install podman-compose${NC}"
  exit 1
fi

# Función para verificar si el container existe
container_exists() {
  podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Función para verificar si el container está corriendo
container_running() {
  podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Función para esperar a que PostgreSQL esté listo
wait_for_postgres() {
  echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté listo...${NC}"
  local max_attempts=30
  local attempt=0
  
  until podman exec $CONTAINER_NAME pg_isready -U ${DB_USERNAME:-postgres} &> /dev/null || [ $attempt -eq $max_attempts ]; do
    attempt=$((attempt + 1))
    echo -e "${YELLOW}   Intento $attempt/$max_attempts...${NC}"
    sleep 1
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ PostgreSQL no respondió a tiempo${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ PostgreSQL está listo${NC}\n"
}

# Verificar estado del container
if container_exists; then
  if container_running; then
    echo -e "${GREEN}✅ Container PostgreSQL ya está corriendo${NC}\n"
  else
    echo -e "${YELLOW}🔄 Container existe pero está detenido. Levantando...${NC}"
    podman start $CONTAINER_NAME
    wait_for_postgres
  fi
else
  echo -e "${YELLOW}📦 Container no existe. Creando con podman-compose...${NC}"
  podman-compose up -d
  wait_for_postgres
fi

# Ejecutar migraciones
echo -e "${YELLOW}🔄 Ejecutando migraciones...${NC}"
pnpm migration:run

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Migraciones ejecutadas${NC}\n"
else
  echo -e "${RED}❌ Error ejecutando migraciones${NC}"
  exit 1
fi

# Ejecutar seeds (solo si se pasa flag --seed)
if [ "$1" = "--seed" ]; then
  echo -e "${YELLOW}🌱 Ejecutando seeds...${NC}"
  pnpm seed
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Seeds ejecutados${NC}\n"
  else
    echo -e "${RED}❌ Error ejecutando seeds${NC}"
    exit 1
  fi
fi

# Iniciar la aplicación
echo -e "${GREEN}🚀 Iniciando aplicación en modo desarrollo...${NC}\n"
cd test-app && pnpm start:dev
