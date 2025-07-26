## 0. setup environment

On Mac :

	brew install ariga/tap/atlas

On Linux :

	curl -sSf https://atlasgo.sh | sh -s -- --community

Setup to you database url :

	export ATLAS_URL="mysql://coze:coze123@localhost:3306/opencoze?charset=utf8mb4&parseTime=True"

## 2. init baseline

	# cd ./docker/atlas
	atlas migrate diff initial --env local --to $ATLAS_URL
	
	# The following command is the same as the one above.
	atlas migrate diff initial \
	  --dir "file://migrations" \
	  --to $ATLAS_URL \
	  --dev-url "docker://mysql/8/"

## 3. update database table

On developer machine（I want add/update table for my business）

	# First, add or update your table as needed.
	
	# Second, autogenerate diff sql 
	# cd ./docker/atlas
	atlas migrate diff update --env local --to $ATLAS_URL  # step 1
	
	# The following command is the same as the one above.
	atlas migrate diff update \
	  --dir "file://migrations" \
	  --to $ATLAS_URL \
	  --dev-url "docker://mysql/8/"
	# will autogenerate some xxxxx_update.sql in margrations
	
	
	# Third, Check whether the contents of the new xxxx_update.sql file are correct.
	# If any changes are needed, please modify it manually.
	# If you manually modified margrations file, you need to run the following command to update its hash value.
	# If you did not manually modify margrations file, do not run the following command.
	atlas migrate hash  # step 2 if need
	atlas migrate status --url $ATLAS_URL --dir "file://migrations" # check status 
	
	# Last, dump the latest database schema for other developer
	atlas schema inspect -u $ATLAS_URL --exclude "atlas_schema_revisions,table_*"  > opencoze_latest_schema.hcl # step 3 

## 4. apply migration

On developer machine（I want to update my local database with the changes that others developer have made）

	# cd ./docker/atlas
	atlas schema apply -u $ATLAS_URL --to file://opencoze_latest_schema.hcl # step 1 for developer on mac, this command will execute in start_debug.sh

On Server machine

	atlas migrate apply --url $ATLAS_URL --dir "file://migrations"  --baseline "20250703095335" # step 1 for dev server








