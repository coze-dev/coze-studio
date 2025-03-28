#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}" || exit 1

# Check if go-jsonschema is installed
if ! command -v go-jsonschema &> /dev/null; then
    echo "Installing go-jsonschema..."
    go install github.com/omissis/go-jsonschema/cmd/go-jsonschema@latest
fi

# Function to process yml files
process_yml_file() {
    local yml_file="$1"
    local rel_path="${yml_file#./}"
    local base_name
    
    # Handle both .yml and .yaml extensions
    if [[ "$yml_file" == *.schema.yml ]]; then
        base_name="$(basename "${yml_file}" .yml)"
    else
        base_name="$(basename "${yml_file}" .yaml)"
    fi
    
    local dir_name="$(dirname "${rel_path}")"
    
    # Create corresponding directory in domain
    local domain_dir="../../domain/${dir_name}/dal/model"
    mkdir -p "$domain_dir"
    
    # Generate Go file
    local output_file="$domain_dir/${base_name}.go"
    echo "Processing $yml_file -> $output_file"
    
    # Generate Go structs from yml file
    go-jsonschema --capitalization ID --only-models --package model --output "${output_file}" "${yml_file}"
}

# Find and process all schema files in ddl directory
find . -type f \( -name "*.schema.yml" -o -name "*.schema.yaml" \) | while read -r file; do
    process_yml_file "${file}"
done

echo "JSON schema to Go struct generation completed!"