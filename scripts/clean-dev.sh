#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}🧹 Limpiando entorno de desarrollo${NC}\n"

read -p "¿Estás seguro? Esto eliminará el container y TODOS los datos de la BD (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Cancelado${NC}"
  exit 1
fi

CONTAINER_NAME="backend-core-postgres"

# Detener container si está corriendo
if podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
  echo -e "${YELLOW}⏸️  Deteniendo container...${NC}"
  podman stop $CONTAINER_NAME
fi

# Eliminar container si existe
if podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
  echo -e "${YELLOW}🗑️  Eliminando container...${NC}"
  podman rm $CONTAINER_NAME
fi

# Eliminar volúmenes
echo -e "${YELLOW}🗑️  Eliminando volúmenes...${NC}"
podman-compose down -v

echo -e "${GREEN}✅ Limpieza completada${NC}"
