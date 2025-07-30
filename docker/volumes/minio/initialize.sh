#!/bin/sh

# Run initialization in background
(
  # Wait for MinIO to be ready
  until (/usr/bin/mc alias set localminio http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}) do
    echo "Waiting for MinIO to be ready..."
    sleep 1
  done

  # Create bucket and copy files
  /usr/bin/mc mb --ignore-existing localminio/${STORAGE_BUCKET}
  /usr/bin/mc cp --recursive /default_icon/ localminio/${STORAGE_BUCKET}/default_icon/
  /usr/bin/mc cp --recursive /official_plugin_icon/ localminio/${STORAGE_BUCKET}/official_plugin_icon/

  echo "MinIO initialization complete."
) &

# Start minio server in foreground
exec minio server /data --console-address ":9001"
