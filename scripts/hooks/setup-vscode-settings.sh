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


# Script to ensure .vscode/settings.json exists by copying from template
# This script creates default VSCode settings if none exist

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VSCODE_DIR="$PROJECT_ROOT/.vscode"
SETTINGS_FILE="$VSCODE_DIR/settings.json"
TEMPLATE_FILE="$VSCODE_DIR/settings.template.json"

# Function to log messages (only when VERBOSE=true)
log() {
    if [[ "${VERBOSE:-false}" == "true" ]]; then
        echo "[setup-vscode-settings] $1"
    fi
}

# Create .vscode directory if it doesn't exist
if [[ ! -d "$VSCODE_DIR" ]]; then
    log "Creating .vscode directory..."
    mkdir -p "$VSCODE_DIR"
fi

# Check if settings.json exists
if [[ ! -f "$SETTINGS_FILE" ]]; then
    log "settings.json not found"
    
    # Check if template file exists
    if [[ -f "$TEMPLATE_FILE" ]]; then
        log "Copying settings.template.json to settings.json..."
        cp "$TEMPLATE_FILE" "$SETTINGS_FILE"
        log "✓ settings.json created from template"
    else
        log "Warning: settings.template.json not found, creating minimal settings.json..."
        
        # Create a minimal settings.json if template doesn't exist
        cat > "$SETTINGS_FILE" << 'EOF'
{
  "search.exclude": {
    "**/node_modules": true,
    "**/common/temp": true,
    "**/.rush": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/common/temp": true,
    "**/.rush": true
  }
}
EOF
        log "✓ Minimal settings.json created"
    fi
else
    log "settings.json already exists, skipping..."
fi