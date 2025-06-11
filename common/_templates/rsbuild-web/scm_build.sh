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
install_project_deps

build_project

mkdir -p ${ROOT_DIR}/output
cp -r ./dist/* ${ROOT_DIR}/output/
