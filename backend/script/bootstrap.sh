#!/bin/bash
CURDIR=$(cd $(dirname $0); pwd)
BinaryName=hertz_service
echo "$CURDIR/bin/${BinaryName}"
exec $CURDIR/bin/${BinaryName}