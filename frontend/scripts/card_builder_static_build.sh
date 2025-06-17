#!/usr/bin/env bash

set -ex

# Switch cwd to the project folder
cd $(dirname "$0")

# Import the utilities functions
source ./scm_base.sh

# Clean up the build directory
rm -rf dist output output_resource ${ROOT}/output ${ROOT}/output_resource

# Prepare
prepare_environment

# Install the dependencies
install_package_deps @flowpd/card-lynx-runtime

SKIP_POST_INSTALL=true rush build -t @flowpd/card-lynx-runtime

# Create artifact
OUTPUT_DIR="${ROOT_DIR}/output"
OUTPUT_RESOURCE_DIR="${ROOT_DIR}/output_resource"

# copy lynx runtime sdk
cp -r "${ROOT_DIR}"/packages/lynx-runtime-sdk/dist "${OUTPUT_DIR}"/lynx_sdk/"${CUSTOM_LYNX_VERSION}"
cp -r "${ROOT_DIR}"/packages/lynx-runtime-sdk/dist "${OUTPUT_RESOURCE_DIR}"/lynx_sdk/"${CUSTOM_LYNX_VERSION}"

# if [[ $CUSTOM_VERSION = 'release' ]]; then
#   TARGETS=("sg" "va")
#   SOURCES=("sg_release" "va_release")
# else
#   TARGETS=("boe" "cn" "sg")
#   SOURCES=("cn_boe" "cn_inhouse" "sg_inhouse")
# fi


# # Loop through targets and sources
# for ((i=0; i<${#TARGETS[@]}; i++)); do
#   # Create output directories
#   mkdir -p "${OUTPUT_DIR}/${TARGETS[i]}"
#   mkdir -p "${OUTPUT_RESOURCE_DIR}/${TARGETS[i]}"

#   # Copy index.html
#   cp "./output/${SOURCES[i]}/"*.html "${OUTPUT_DIR}/${TARGETS[i]}"

#   # Copy static files
#   cp -r "./output/${SOURCES[i]}/"* "${OUTPUT_RESOURCE_DIR}/${TARGETS[i]}"
# done
