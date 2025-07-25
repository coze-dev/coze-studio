#!/bin/bash
export HERTZTOOL_VERSION=v3.4.1

CURDIR=$(cd $(dirname $0); pwd)
if [ "X$1" != "X" ]; then
	RUNTIME_ROOT=$1
else
	RUNTIME_ROOT=${CURDIR}
fi

if [ "X$RUNTIME_ROOT" == "X" ]; then
	echo "There is no RUNTIME_ROOT support."
	echo "Usage: ./bootstrap.sh $RUNTIME_ROOT"
	exit -1
fi

PORT=$2

RUNTIME_CONF_ROOT=$RUNTIME_ROOT/conf

if [ "${IS_TCE_DOCKER_ENV}" == 1 ] && [ -n "${RUNTIME_LOGDIR}" ]; then
    RUNTIME_LOG_ROOT=$RUNTIME_LOGDIR
else
    RUNTIME_LOG_ROOT=$RUNTIME_ROOT/log
fi

if [ ! -d $RUNTIME_LOG_ROOT/app ]; then
	mkdir -p $RUNTIME_LOG_ROOT/app
fi

if [ ! -d $RUNTIME_LOG_ROOT/rpc ]; then
	mkdir -p $RUNTIME_LOG_ROOT/rpc
fi

if [ "$IS_HOST_NETWORK" == "1" ]; then
	export RUNTIME_SERVICE_PORT=$PORT0
	export RUNTIME_DEBUG_PORT=$PORT1
fi

SVC_NAME=tt.pns.data_infra_ai_platform

BinaryName=tt.pns.data_infra_ai_platform

export HERTZ_LOG_DIR=$RUNTIME_LOG_ROOT
export PSM=$SVC_NAME
CONF_DIR=$CURDIR/conf/

args="-psm=$SVC_NAME -conf-dir=$CONF_DIR -log-dir=$HERTZ_LOG_DIR"
if [ "X$PORT" != "X" ]; then
	args+=" -port=$PORT"
fi

echo "Checking for Python virtual environment under $BIN_DIR"

VENV_DIR="$CURDIR/.venv"
if [ ! -f "$VENV_DIR/bin/activate" ]; then
    echo "Virtual environment not found or incomplete. Re-creating..."
    rm -rf "$VENV_DIR"
    python3 -m venv "$VENV_DIR"

    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment - aborting startup"
        exit 1
    fi

    echo "Virtual environment created successfully!"
    # 激活虚拟环境
    source "$VENV_DIR/bin/activate"

    # 安装requests包
    echo "Installing requests package..."
    pip install requests

    if [ $? -ne 0 ]; then
        echo "Failed to install requests package - aborting startup"
        exit 1
    fi
    echo "Successfully installed requests package!"

    # 退出虚拟环境
    deactivate
else
    echo "Virtual environment already exists. Skipping creation."
fi

echo "$CURDIR/bin/${BinaryName} $args"

exec $CURDIR/bin/${BinaryName} $args