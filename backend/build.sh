#!/bin/bash
RUN_NAME="data.ecom.workflow_engine_next"
cd backend
mkdir -p output/bin output/conf
cp script/bootstrap.sh output 2>/dev/null
chmod +x output/bootstrap.sh
cp script/bootstrap.sh output/bootstrap_staging.sh
chmod +x output/bootstrap_staging.sh
find conf/ -type f ! -name "*_local.*" | xargs -I{} cp {} output/conf/
cp run.sh output/run.sh
cp -r conf/* output/conf/

export CGO_ENABLED=0 && go build -o output/bin/${RUN_NAME}
cp -a output/. ../output/