#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$BASE_DIR/backend"
DOCKER_DIR="$BASE_DIR/docker"
BIN_DIR="$BASE_DIR/bin"

echo "🔄 BASE_DIR: $BASE_DIR"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Directory not found: $BACKEND_DIR"
    exit 1
fi

rm -rf "$BIN_DIR/opencoze"

echo "🛠  Building Go project..."

cd $BACKEND_DIR &&
    go build -ldflags="-s -w" -o "$BIN_DIR/opencoze" main.go

# 添加构建失败检查
if [ $? -ne 0 ]; then
    echo "❌ Go build failed - aborting startup"
    exit 1
fi

dir_created=0
[ ! -d "$DOCKER_DIR/data/mysql" ] && {
    mkdir -p "$DOCKER_DIR/data/mysql"
    dir_created=1
}
[ ! -d "$DOCKER_DIR/data/redis" ] && {
    mkdir -p "$DOCKER_DIR/data/redis"
    dir_created=1
}

[ ! -d "$DOCKER_DIR/data/rocketmq/broker/store" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/broker/store"
    dir_created=1
}

[ ! -d "$DOCKER_DIR/data/rocketmq/broker/logs" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/broker/logs"
    dir_created=1
}
[ ! -d "$DOCKER_DIR/data/rocketmq/namesrv/logs" ] && {
    mkdir -p "$DOCKER_DIR/data/rocketmq/namesrv/logs"
    dir_created=1
}

[ "$dir_created" -eq 1 ] && echo "📂 Creating data directories..."

echo "🐳 Starting Docker services..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" up -d || {
    echo "❌ Failed to start Docker services - aborting startup"
    exit 1
}

echo "⏳ Waiting for MySQL to be ready..."
timeout=30
while ! docker exec opencoze-mysql mysqladmin ping -h localhost --silent; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ MySQL startup timed out"
        exit 1
    fi
done

echo "⏳ Waiting for Kafka to be ready..."
timeout=60
while ! docker exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092 >/dev/null 2>&1; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ Kafka startup timed out"
        exit 1
    fi
done

echo "🔍 Checking database existence..."
timeout=30
while ! docker exec opencoze-mysql mysql -uroot -proot -h127.0.0.1 --protocol=tcp -e "USE opencoze" 2>/dev/null; do
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "❌ Database 'opencoze' not created"
        exit 1
    fi
done

echo "🔧 Initializing database..."
docker exec opencoze-mysql bash -c 'echo -e "[client]\nuser=root\npassword=root" > /root/.my.cnf'

SQL_FILES=$(find "$BACKEND_DIR/types/ddl" -type f -name "*.sql" | sort)
for sql_file in $SQL_FILES; do
    docker exec -i opencoze-mysql mysql --defaults-extra-file=/root/.my.cnf -f opencoze <"$sql_file"
done

echo "📑 Copying environment file..."
if [ -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env" "$BIN_DIR/.env"
else
    echo "❌ .env file not found in $BACKEND_DIR"
    exit 1
fi

echo "🚀 Starting Go service..."
cd $BIN_DIR && "./opencoze"
