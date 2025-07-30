#!/bin/sh

echo "Bootstrapping Coze Studio... 07-30"

# Set up Elasticsearch
echo "Setting up Elasticsearch..."
/app/setup_es.sh --index-dir /app/es_index_schemas

# Start the main application in the foreground
echo "Starting main application..."
/app/opencoze
echo "Main application exited."
