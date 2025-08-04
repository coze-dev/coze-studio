#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../../" && pwd)"
ATLAS_DIR="$BASE_DIR/docker/atlas"
DOCKER_DIR="$(cd "$SCRIPT_DIR/../../docker" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if ATLAS_URL is set
if [ -z "$ATLAS_URL" ]; then
    echo -e "${RED}Error: ATLAS_URL is not set. Please set the ATLAS_URL environment variable.${NC}"
    exit 1
fi


echo "ATLAS_URL: $ATLAS_URL"

#  check if atlas is installed
OS=$(uname -s)

if command -v atlas &>/dev/null; then
    echo -e "${GREEN}Atlas is installed.${NC}"
else
    if [ "$OS" = "Darwin" ]; then
        # macOS prompt
        echo -e "${RED}Atlas is not installed. Please execute the following command to install:${NC}"
        echo -e "${RED}brew install ariga/tap/atlas${NC}"
        exit 1
    else
        # Linux prompt
        echo -e "${RED}Atlas is not installed. Please execute the following command to install:${NC}"
        echo -e "${RED}curl -sSf https://atlasgo.sh | sh -s -- --community${NC}"
        exit 1
    fi
fi

cd $ATLAS_DIR

atlas migrate diff update --env local --to $ATLAS_URL

atlas schema inspect -u $ATLAS_URL --exclude "atlas_schema_revisions,table_*" >opencoze_latest_schema.hcl
