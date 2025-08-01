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
