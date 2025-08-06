#!/bin/bash

set -e

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    echo "Running in dry-run mode. No images will be pulled, tagged, or pushed."
fi

TARGET_REGISTRY="opencoze-cn-beijing.cr.volces.com/iac"

images=(
    "mysql:8.4.5"
    "bitnami/redis:8.0"
    "opencoze/opencoze:latest"
    "apache/rocketmq:5.3.2"
    "bitnami/elasticsearch:8.18.0"
    "minio/minio:RELEASE.2025-06-13T11-33-47Z-cpuv1"
    "minio/mc:RELEASE.2025-05-21T01-59-54Z-cpuv1"
    "arigaio/atlas:0.35.0-community-alpine"
    "bitnami/etcd:3.5"
    "alpine/curl:8.12.1"
    "milvusdb/milvus:v2.5.10"
    "busybox:latest"
)

# Function to tag and push an image
tag_and_push() {
    source_image=$1
    # Extract image name and tag (e.g., "etcd:3.5" from "bitnami/etcd:3.5")
    image_name_tag=$(basename "$source_image")
    target_image="$TARGET_REGISTRY/$image_name_tag"

    echo "Tagging $source_image as $target_image"
    if [ "$DRY_RUN" = false ]; then
        docker tag "$source_image" "$target_image"
    else
        echo "[dry-run] docker tag \"$source_image\" \"$target_image\""
    fi

    echo "Pushing $target_image"
    if [ "$DRY_RUN" = false ]; then
        docker push "$target_image"
    else
        echo "[dry-run] docker push \"$target_image\""
    fi
    echo ""
}

# Pull all images first
for image in "${images[@]}"; do
    if docker image inspect "${image}" >/dev/null 2>&1; then
        echo "Image ${image} already exists locally, skipping pull."
    else
        echo "Pulling ${image}"
        if [ "${DRY_RUN}" = false ]; then
            docker pull "${image}"
        else
            echo "[dry-run] docker pull \"${image}\""
        fi
    fi
done

echo "All images pulled successfully."
echo ""

# Tag and push all images
for image in "${images[@]}"; do
    tag_and_push "$image"
done

echo "All images have been tagged and pushed to $TARGET_REGISTRY."
