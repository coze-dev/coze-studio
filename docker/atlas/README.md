## 0. environment

On Mac : brew install ariga/tap/atlas
On Linux : curl -sSf https://atlasgo.sh | sh -s -- --community

export ATLAS_URL="mysql://coze:coze123@localhost:3306/opencoze?charset=utf8mb4&parseTime=True"

## 2. init baseline  

<!-- atlas schema inspect -u $ATLAS_URL --format '{{ sql . }}' > schema.sql -->

> atlas migrate diff initial \
  --dir "file://migrations" \
  --to $ATLAS_URL \
  --dev-url "docker://mysql/8/"

## 3. update database schema 

in atlas directory

> atlas migrate diff update --env local --to $ATLAS_URL

or 

> atlas migrate diff update \
  --dir "file://migrations" \
  --to $ATLAS_URL \
  --dev-url "docker://mysql/8/"

## 4. apply migration

in atlas directory

atlas migrate apply --env local 

or 

> atlas migrate apply \
  --url $ATLAS_URL \
  --dir "file://migrations" \
  --baseline "20250609083036"


> atlas migrate apply \
  --url $ATLAS_URL \
  --dir "file://migrations" \
  --allow-dirty  \
  --dry-run

## 5. manual migrations

in atlas directory

edit migrations/sql

> atlas migrate hash