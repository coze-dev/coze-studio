#!/bin/sh

# Set up Elasticsearch
echo "Setting up Elasticsearch..."
/app/setup_es.sh --index-dir /app/es_index_schemas

# Start the main application in the foreground
echo "Starting main application..."
/app/opencoze
echo "Main application exited."
