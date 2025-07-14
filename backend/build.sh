#!/bin/bash
RUN_NAME="data.ecom.workflow_engine_next"
cd backend
mkdir -p output/bin output/conf output/bin/app
cp script/bootstrap.sh output 2>/dev/null
chmod +x output/bootstrap.sh
cp script/bootstrap.sh output/bootstrap_staging.sh
chmod +x output/bootstrap_staging.sh
find conf/ -type f ! -name "*_local.*" | xargs -I{} cp {} output/conf/
cp run.sh output/run.sh
cp infra/impl/document/parser/builtin/parse_pdf.py output/bin/app/parse_pdf.py
cp infra/impl/document/parser/builtin/parse_docx.py output/bin/app/parse_docx.py
cp -r conf/* output/conf/

export CGO_ENABLED=0 && go build -o output/bin/${RUN_NAME}
cp -a output/. ../output/