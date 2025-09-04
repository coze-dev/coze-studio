#!/bin/bash
#
# Copyright 2025 coze-dev Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#


# OceanBase Environment Configuration Script
# Dynamically modify vector store type in environment files

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_ROOT/../docker"

# Environment type
ENV_TYPE="${1:-debug}"

# Validate environment type
if [[ "$ENV_TYPE" != "debug" && "$ENV_TYPE" != "env" ]]; then
    echo -e "${RED}Error: Invalid environment type '$ENV_TYPE'${NC}"
    echo "Usage: $0 [debug|env]"
    echo "  debug - Test environment (.env.debug)"
    echo "  env   - Production environment (.env)"
    exit 1
fi

# Determine target environment file
if [[ "$ENV_TYPE" == "debug" ]]; then
    TARGET_ENV_FILE="$DOCKER_DIR/.env.debug"
else
    TARGET_ENV_FILE="$DOCKER_DIR/.env"
fi

# Check if target environment file exists
if [[ ! -f "$TARGET_ENV_FILE" ]]; then
    if [[ "$ENV_TYPE" == "debug" ]]; then
        cp "$DOCKER_DIR/.env.debug.example" "$TARGET_ENV_FILE"
    else
        cp "$DOCKER_DIR/.env.example" "$TARGET_ENV_FILE"
    fi
fi

# Check if already configured for OceanBase
if grep -q "VECTOR_STORE_TYPE.*oceanbase" "$TARGET_ENV_FILE"; then
    echo -e "${YELLOW}Already configured for OceanBase${NC}"
else
    echo -e "${GREEN}Configuring OceanBase...${NC}"

    # Use sed to replace VECTOR_STORE_TYPE
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS requires special handling - use temporary file to avoid .bak creation
        sed "s/export VECTOR_STORE_TYPE=\"milvus\"/export VECTOR_STORE_TYPE=\"oceanbase\"/g" "$TARGET_ENV_FILE" > "$TARGET_ENV_FILE.tmp"
        sed "s/export VECTOR_STORE_TYPE=\"vikingdb\"/export VECTOR_STORE_TYPE=\"oceanbase\"/g" "$TARGET_ENV_FILE.tmp" > "$TARGET_ENV_FILE"
        rm -f "$TARGET_ENV_FILE.tmp"
    else
        # Linux systems
        sed -i "s/export VECTOR_STORE_TYPE=\"milvus\"/export VECTOR_STORE_TYPE=\"oceanbase\"/g" "$TARGET_ENV_FILE"
        sed -i "s/export VECTOR_STORE_TYPE=\"vikingdb\"/export VECTOR_STORE_TYPE=\"oceanbase\"/g" "$TARGET_ENV_FILE"
    fi
fi

# Verify configuration
if grep -q "VECTOR_STORE_TYPE.*oceanbase" "$TARGET_ENV_FILE"; then
    echo -e "${GREEN}✅ OceanBase configured successfully${NC}"
else
    echo -e "${RED}❌ Failed to configure OceanBase${NC}"
    exit 1
fi
