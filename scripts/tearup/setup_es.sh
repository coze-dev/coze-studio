#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}⏳ Adjusting Elasticsearch disk watermark settings...${NC}"
timeout=30
while true; do
    response=$(curl -s -X PUT "localhost:9200/_cluster/settings" -H 'Content-Type: application/json' -d'
    {
      "transient": {
        "cluster.routing.allocation.disk.watermark.low": "99%",
        "cluster.routing.allocation.disk.watermark.high": "99%",
        "cluster.routing.allocation.disk.watermark.flood_stage": "99%",
        "cluster.info.update.interval": "1m"
      }
    }')

    if echo "$response" | grep -q '"acknowledged":true'; then
        echo -e "${GREEN}✅ Elasticsearch disk watermark settings adjusted successfully${NC}"
        break
    else
        echo -e "${YELLOW}⚠️ Failed to adjust Elasticsearch disk watermark settings, retrying...${NC}"
        sleep 1
        timeout=$((timeout - 1))
        if [ $timeout -le 0 ]; then
            echo -e "${RED}❌ Timeout reached while adjusting Elasticsearch settings${NC}"
            break
        fi
    fi
done
echo ""

echo -e "${GREEN}⏳ 等待Elasticsearch准备就绪...${NC}"
timeout=30
while ! curl -s "http://localhost:9200/_cluster/health" | grep -q '"status":"\(green\|yellow\)"'; do
    adjust_elasticsearch_watermark
    sleep 1
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo -e "${YELLOW}⚠️ Elasticsearch startup timed out, but continuing...${NC}"
        break
    fi
done

echo -e "${GREEN}🔍 初始化Elasticsearch索引模板...${NC}"
ES_TEMPLATES=$(find "$BACKEND_DIR/types/ddl/search" -type f -name "*.index-template.json" | sort)
if [ -z "$ES_TEMPLATES" ]; then
    echo -e "${YELLOW}ℹ️ No Elasticsearch index templates found in $BACKEND_DIR/types/ddl/search${NC}"
else
    # 新增索引创建逻辑
    echo -e "${GREEN}🔄 Creating Elasticsearch indexes...${NC}"
    for template_file in $ES_TEMPLATES; do

        template_name=$(basename "$template_file" | sed 's/\.index-template\.json$//')
        echo -e "${GREEN}➡️ Registering template: $template_name${NC}"

        # 尝试注册索引模板
        response=$(curl -s -X PUT "http://localhost:9200/_index_template/$template_name" \
            -H "Content-Type: application/json" \
            -d @"$template_file" 2>&1)

        # 检查是否成功
        if echo "$response" | grep -q '"acknowledged":true'; then
            echo -e "${GREEN}✅ Template $template_name registered successfully${NC}"
        else
            echo -e "${YELLOW}⚠️ Template registration response: $response${NC}"
        fi

        index_name=$(basename "$template_file" | sed 's/\.index-template\.json$//')
        echo -e "${GREEN}➡️ Creating index: $index_name${NC}"

        # 检查索引是否存在
        if ! curl -s -f "http://localhost:9200/_cat/indices/$index_name" >/dev/null; then
            # 创建索引（匹配模板的index_patterns）
            curl -X PUT "http://localhost:9200/$index_name" -H "Content-Type: application/json"
            echo ""
        else
            echo -e "${YELLOW}ℹ️ Index $index_name already exists${NC}"
        fi
    done
fi
