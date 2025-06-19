.PHONY: debug fe server sync_db dump_db docker docker-web docker-down docker-clean python help

# 定义脚本路径
SCRIPTS_DIR := ./scripts


BUILD_FE_SCRIPT := $(SCRIPTS_DIR)/build_fe.sh
BUILD_SERVER_SCRIPT := $(SCRIPTS_DIR)/setup/server.sh
SYNC_DB_SCRIPT := $(SCRIPTS_DIR)/setup/db_migrate_apply.sh
DUMP_DB_SCRIPT := $(SCRIPTS_DIR)/setup/db_migrate_dump.sh
SETUP_DOCKER_SCRIPT := $(SCRIPTS_DIR)/setup/docker.sh
SETUP_PYTHON_SCRIPT := $(SCRIPTS_DIR)/setup/python.sh
COMPOSE_FILE := docker/docker-compose.yml

debug: docker sync_db python server

fe:
	@echo "Building frontend..."
	@bash $(BUILD_FE_SCRIPT)

server:
	@echo "Building and start server..."
	@bash $(BUILD_SERVER_SCRIPT) -start

build_server:
	@echo "Building server..."
	@bash $(BUILD_SERVER_SCRIPT)

sync_db:
	@echo "Syncing database..."
	@bash $(SYNC_DB_SCRIPT)

dump_db:
	@echo "Dumping database..."
	@bash $(DUMP_DB_SCRIPT)

docker:
	@echo "Start docker environment for opencoze app"
	@bash $(SETUP_DOCKER_SCRIPT)

docker-web:
	@echo "Start web server in docker"
	@docker compose -f $(COMPOSE_FILE) --env-file ./backend/.env up -d

docker-down:
	@echo "Stop all docker containers"
	@docker compose -f $(COMPOSE_FILE) down

docker-clean: docker-down
	@echo "Remove docker containers and volumes"
	@rm -rf ./docker/data

python:
	@echo "Setting up Python..."
	@bash $(SETUP_PYTHON_SCRIPT)

atlas-hash:
	@echo "Rehash atlas migration files..."
	@(cd ./docker/atlas && atlas migrate hash)

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  debug            - Start the debug environment."
	@echo "  fe               - Build the frontend."
	@echo "  server           - Build and run the server binary."
	@echo "  build_server     - Build the server binary."
	@echo "  sync_db          - Sync opencoze_latest_schema.hcl to the database."
	@echo "  dump_db          - Dump the database to opencoze_latest_schema.hcl and migrations files."
	@echo "  docker           - Setup docker environment, but exclude the server app."
	@echo "  docker-web       - Setup docker environment, include the server docker."
	@echo "  docker-down      - Stop the docker containers."
	@echo "  docker-clean     - Stop the docker containers and clean volumes."
	@echo "  python           - Setup python environment."
	@echo "  atlas-hash       - Rehash atlas migration files."
	@echo "  help             - Show this help message."