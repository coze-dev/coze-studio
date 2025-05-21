#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/../../docker" && pwd)"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

export LOCAL_USER_ID=$(id -u)
export LOCAL_GROUP_ID=$(id -g)

if [ ! -d "$DOCKER_DIR" ]; then
    echo -e "${RED}❌ Directory not found: $DOCKER_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}🐳 Starting Docker services...${NC}"
docker compose -f "$DOCKER_DIR/docker-compose.yml" up -d || {
    echo -e "${RED}❌ Failed to start Docker services - aborting startup${NC}"
    exit 1
}

echo -e "${YELLOW}⏳ Waiting for all containers to reach healthy status...${NC}"

# Get all container IDs
CONTAINER_IDS=$(docker compose -f "$DOCKER_DIR/docker-compose.yml" ps -q)

# Set timeout (seconds)
TIMEOUT=120
START_TIME=$(date +%s)

# Wait for all containers to be healthy
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
    
    # Check if timeout has occurred
    if [ $ELAPSED_TIME -gt $TIMEOUT ]; then
        echo -e "${RED}❌ Waiting for container health status timed out (${TIMEOUT} seconds)${NC}"
        echo -e "${YELLOW}⚠️ Some containers may not have reached healthy status, but services might still be available${NC}"
        break
    fi
    
    # Check health status of all containers
    ALL_HEALTHY=true
    UNHEALTHY_CONTAINERS=""
    
    for CONTAINER_ID in $CONTAINER_IDS; do
        # Get container name
        CONTAINER_NAME=$(docker inspect --format '{{.Name}}' $CONTAINER_ID)
        CONTAINER_NAME=${CONTAINER_NAME##/}
        # Check if container has health check
        HAS_HEALTHCHECK=$(docker inspect --format '{{if .Config.Healthcheck}}true{{else}}false{{end}}' $CONTAINER_ID)
        
        if [ "$HAS_HEALTHCHECK" = "true" ]; then
            # Get health status
            HEALTH_STATUS=$(docker inspect --format '{{.State.Health.Status}}' $CONTAINER_ID)
            
            if [ "$HEALTH_STATUS" != "healthy" ]; then
                ALL_HEALTHY=false
                UNHEALTHY_CONTAINERS="$UNHEALTHY_CONTAINERS\n  - $CONTAINER_NAME ($HEALTH_STATUS)"
            fi
        fi
    done
    
    if [ "$ALL_HEALTHY" = "true" ]; then
        echo -e "${GREEN}✅ All containers have reached healthy status!${NC}"
        break
    else
        # Display progress and remaining time
        REMAINING_TIME=$((TIMEOUT - ELAPSED_TIME))
        echo -e "${YELLOW}⏳ Waiting for container health status... Elapsed time: ${ELAPSED_TIME}s, Remaining time: ${REMAINING_TIME}s${NC}"
        echo -e "${YELLOW}Containers not ready:${UNHEALTHY_CONTAINERS}${NC}"
        sleep 5
    fi
done
