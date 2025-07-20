#!/usr/bin/env bash

set -ex

# Switch cwd to the project folder
cd $(dirname "$0")

# Import the utilities functions
source ../../scripts/scm_base.sh

# Clean up the build directory
rm -rf dist
rm -rf "${ROOT_DIR}"/output

# Prepare
prepare_environment

# Install the dependencies
CUSTOM_SKIP_POST_INSTALL=true rushx --debug install -t . -t tag:phase-prebuild -t @coze-arch/rush-x -t tag:rush-tools

NO_STARLING=true bash $ROOT_DIR/scripts/post-rush-install.sh

NODE_OPTIONS='--max-old-space-size=8192' NODE_ENV=production  npm run build

mkdir -p ${ROOT_DIR}/output
mkdir -p ${ROOT_DIR}/output_resource/static
cp -r ./dist/index.html ${ROOT_DIR}/output/

cp -r ./dist/static/* ${ROOT_DIR}/output_resource/static
