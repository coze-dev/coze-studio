#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/../../docker" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$DOCKER_DIR/atlas"

source "$DOCKER_DIR/.env"
echo "ATLAS_URL: $ATLAS_URL"

# Check if ATLAS_URL is set
if [ -z "$ATLAS_URL" ]; then
    echo -e "${RED}Error: ATLAS_URL is not set. Please set the ATLAS_URL environment variable.${NC}"
    exit 1
fi

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

cd "$DOCKER_DIR/atlas"

atlas schema apply -u $ATLAS_URL --to file://opencoze_latest_schema.hcl --exclude "atlas_schema_revisions,table_*" --auto-approve
echo -e "${GREEN}✅ apply mysql schema successfully${NC}"

# if [ "$OS" = "Darwin" ]; then
#     atlas schema apply -u $ATLAS_URL --to file://opencoze_latest_schema.hcl --auto-approve --exclude "table_*"
#     echo -e "${GREEN}✅ apply mysql schema successfully${NC}"
# elif [ "$OS" = "Linux" ]; then
#     atlas migrate apply \
#         --url "$ATLAS_URL" \
#         --dir "file://migrations" \
#         --revisions-schema opencoze \
#         --baseline "20250703095335"
#     echo -e "${GREEN}✅ migrate mysql successfully${NC}"
# elif [ "$OS" = "Windows" ]; then
#     echo -e "${RED}Windows is not supported. Please install Atlas manually.${NC}"
#     exit 1
# fi
