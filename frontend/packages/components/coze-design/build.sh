#!/usr/bin/env bash

set -ex

# Switch cwd to the project folder
cd $(dirname "$0")

# Import the utilities functions
source ../../../scripts/scm_base.sh

# Clean up the build directory
rm -rf dist output output_resource ${ROOT}/output ${ROOT}/output_resource

# Prepare
prepare_environment

# Install the dependencies
install_project_deps

npm run build:storybook

# Create artifact
OUTPUT_DIR="${ROOT_DIR}/output"

mkdir -p "${OUTPUT_DIR}/${TARGETS[i]}"

# Copy static files
cp -r "./storybook-static/"* "${OUTPUT_DIR}"
