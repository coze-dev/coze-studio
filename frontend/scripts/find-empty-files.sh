#!/bin/bash

# Directory to search
SEARCH_DIR=${1:-.}  # The default directory is the current directory

# Check input parameters
if [ -z "$SEARCH_DIR" ]; then
  echo "Usage: $0 <search_directory>"
  exit 1
fi

# Get all .tsx and .less files tracked by Git
git ls-files --others --ignored --exclude-standard -o -c -- "$SEARCH_DIR" ':!*.tsx' ':!*.less' | while read -r FILE; do
  if [[ "$FILE" == *.tsx || "$FILE" == *.less ]]; then
    # Get the number of file lines
    LINE_COUNT=$(wc -l < "$FILE")
    # If the file line count is empty, delete the file and output the file path
    if [ "$LINE_COUNT" -eq 0 ]; then
      echo "Deleting empty file: $FILE"
      rm "$FILE"
    fi
  fi
done
