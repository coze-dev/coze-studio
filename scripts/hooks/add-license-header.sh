#!/bin/bash

# License header content
APACHE_LICENSE_HEADER="/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the \"License\");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an \"AS IS\" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */"

SHELL_LICENSE_HEADER="#
# Copyright 2025 coze-dev Authors
#
# Licensed under the Apache License, Version 2.0 (the \"License\");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an \"AS IS\" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#"

# File extensions that require license headers
declare -a FILE_EXTENSIONS=("go" "ts" "tsx" "js" "jsx" "sh")

# Function to check if file already has license header
has_license_header() {
    local file="$1"
    local ext="${file##*.}"
    
    case "$ext" in
        "go"|"ts"|"tsx"|"js"|"jsx")
            # Check for /* Copyright pattern within first 5 lines
            head -n 5 "$file" | grep -q "Copyright.*coze-dev Authors"
            ;;
        "sh")
            # Check for # Copyright pattern within first 10 lines (accounting for shebang)
            head -n 10 "$file" | grep -q "Copyright.*coze-dev Authors"
            ;;
        *)
            return 1
            ;;
    esac
}

# Function to add license header to file
add_license_header() {
    local file="$1"
    local ext="${file##*.}"
    local temp_file=$(mktemp)
    
    case "$ext" in
        "go"|"ts"|"tsx"|"js"|"jsx")
            # Add C-style comment header
            echo "$APACHE_LICENSE_HEADER" > "$temp_file"
            echo "" >> "$temp_file"
            cat "$file" >> "$temp_file"
            ;;
        "sh")
            # Handle shell files with potential shebang
            if head -n 1 "$file" | grep -q "^#!"; then
                # Preserve shebang
                head -n 1 "$file" > "$temp_file"
                echo "$SHELL_LICENSE_HEADER" >> "$temp_file"
                echo "" >> "$temp_file"
                tail -n +2 "$file" >> "$temp_file"
            else
                # No shebang
                echo "$SHELL_LICENSE_HEADER" > "$temp_file"
                echo "" >> "$temp_file"
                cat "$file" >> "$temp_file"
            fi
            ;;
        *)
            echo "Unsupported file extension: $ext"
            rm "$temp_file"
            return 1
            ;;
    esac
    
    # Replace original file with modified version
    mv "$temp_file" "$file"
    return 0
}

# Function to check if file is a text file and should be processed
should_process_file() {
    local file="$1"
    local ext="${file##*.}"
    
    # Check if extension is in our list
    for supported_ext in "${FILE_EXTENSIONS[@]}"; do
        if [[ "$ext" == "$supported_ext" ]]; then
            return 0
        fi
    done
    return 1
}

# Main function
main() {
    local files_modified=0
    
    # Get list of staged files
    staged_files=$(git diff --cached --name-only --diff-filter=ACM)
    
    if [[ -z "$staged_files" ]]; then
        echo "No staged files to process"
        exit 0
    fi
    
    echo "Checking license headers for staged files..."
    
    while IFS= read -r file; do
        # Skip if file doesn't exist (might be deleted)
        [[ ! -f "$file" ]] && continue
        
        # Skip if file shouldn't be processed
        if ! should_process_file "$file"; then
            continue
        fi
        
        echo "Checking: $file"
        
        # Check if file already has license header
        if has_license_header "$file"; then
            echo "  ✓ License header present"
        else
            echo "  + Adding license header"
            if add_license_header "$file"; then
                # Add the modified file back to staging
                git add "$file"
                files_modified=$((files_modified + 1))
                echo "  ✓ License header added and file re-staged"
            else
                echo "  ✗ Failed to add license header"
                exit 1
            fi
        fi
    done <<< "$staged_files"
    
    if [[ $files_modified -gt 0 ]]; then
        echo ""
        echo "Added license headers to $files_modified file(s) and re-staged them for commit."
    else
        echo ""
        echo "All staged files already have proper license headers."
    fi
}

# Run main function
main "$@"