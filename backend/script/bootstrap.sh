#!/bin/sh
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


echo "Bootstrapping Coze Studio... 07-30"

# Set up Elasticsearch
echo "Setting up Elasticsearch..."
/app/setup_es.sh --index-dir /app/es_index_schemas

# Start the main application in the foreground
echo "Starting main application..."
/app/opencoze
echo "Main application exited."
