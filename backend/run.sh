#!/bin/bash
export BYTED_HOST_IPV6=::1 
export RUNTIME_SERVICE_PORT=8251
export RUNTIME_DEBUG_PORT=18251

echo 'build started...'
sh build.sh && doas -e row -p data.ecom.workflow_engine_next sh output/bootstrap.sh