#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/../../docker" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

GREEN='\033[0;32m'
RED='\033[0;31m'

cd "$DOCKER_DIR/atlas"

source "$BACKEND_DIR/.env"
echo "ATLAS_URL: $ATLAS_URL"

if command -v atlas &>/dev/null; then
    atlas migrate apply \
        --url "$ATLAS_URL" \
        --dir "file://migrations" \
        --revisions-schema opencoze \
        --baseline "20250609083036"
    echo -e "${GREEN}✅ migrate mysql successfully"
else
    OS=$(uname -s)
    if [ "$OS" = "Darwin" ]; then
        # macOS prompt
        echo "${RED} Atlas is not installed. Please execute the following command to install:"
        echo "${RED} brew install ariga/tap/atlas"
        exit 1
    elif [ "$OS" = "Linux" ]; then
        # Linux prompt
        echo "${RED} Atlas is not installed. Please execute the following command to install:"
        echo "${RED} curl -sSf https://atlasgo.sh | sh -s -- --community"
        exit 1
    else
        echo "${RED} Unsupported operating system. Please install Atlas manually."
        exit 1
    fi
fi
