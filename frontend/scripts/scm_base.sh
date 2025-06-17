#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$(realpath "$SCRIPT_DIR/..")
echo $ROOT_DIR
RUSH_FILE="$ROOT_DIR/common/scripts/install-run-rush.js"

source "$ROOT_DIR/scripts/setup-env.sh"

# Fix https://code.byted.org/apaas/monorepo/issues/45
# Use the latest git version from leafboat
export PATH=/tmp/leafboat/bin:$PATH

die() {
  echo $1
  exit 1
}

rushx() {
  node $RUSH_FILE "$@"
}

rushtool () {
  RUSH_X_PATH=$ROOT_DIR/ee/infra/rush-x/bin/run
  node $RUSH_X_PATH "$@"
}

# Install multiple package dependencies at the same time.
#
# Usage:
# install_package_deps @kunlun/typings @apaas/vite.app @apaas/react.app
install_package_deps()
{
  if [ $# -eq 0 ]; then
    die "install_package_deps: missing arguments"
  fi

  args=""
  for pkg in "$@";
  do
    args="-t ${pkg} -t tag:rush-tools ${args}"
  done
  rushx --debug install ${args}
}

# Prepare the rush project environment.
prepare_environment()
{
  npm i -g pnpm@8.15.8
}


# Install current project dependencies.
# It will abort with errors if package.json is not found in the current directory.
#
# Usage:
# install_project_deps
install_project_deps()
{
  if [ ! -f package.json ]; then
    die "install_project_deps: package.json not found"
  fi
  install_package_deps .
}


# Build current project.
# It will abort with errors if package.json is not found in the current directory.
#
# Usage:
# build_project
build_project()
{
  if [ ! -f package.json ]; then
    die "build_project: package.json not found"
  fi
  rushx build -t .
}

# Build current project with dependencies.
# It will abort with errors if package.json is not found in the current directory.
#
# Usage:
# build_project_deps
build_project_deps()
{
  if [ ! -f package.json ]; then
    die "build_project: package.json not found"
  fi
  rushx build -T .
}

# Force Build current project.
# It will abort with errors if package.json is not found in the current directory.
#
# Usage:
# build_project_ignore_cache
build_project_ignore_cache()
{
  if [ ! -f package.json ]; then
    die "build_project: package.json not found"
  fi
  rushx build -T . -v
  rushx rebuild -o . -v
}
