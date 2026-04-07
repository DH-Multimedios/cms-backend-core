#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🛑 Deteniendo Backend Core${NC}\n"

CONTAINER_NAME="backend-core-postgres"

if podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
  echo -e "${YELLOW}⏸️  Deteniendo container PostgreSQL...${NC}"
  podman stop $CONTAINER_NAME
  echo -e "${GREEN}✅ Container detenido${NC}"
else
  echo -e "${YELLOW}ℹ️  Container no está corriendo${NC}"
fi
