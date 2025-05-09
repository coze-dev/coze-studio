#!/usr/bin/env bash

# 所有对数据的初始化操作均收拢到这个文件中
# 初始化数据时，要先检查数据是否已存在，保证脚本可幂等执行

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"
ICON_DIR="${SCRIPT_DIR}/default_icon"

# MinIO相关配置
MINIO_HOST="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin123"
MINIO_BUCKET="opencoze"

# 颜色设置
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查MinIO Client (mc)是否安装
check_mc_cli() {
    if ! command -v mc &> /dev/null; then
        echo -e "${YELLOW}MinIO Client (mc) 未安装，正在安装...${NC}"
        brew install minio/stable/mc
        if [ $? -ne 0 ]; then
            echo -e "${RED}安装 MinIO Client 失败，请手动安装：${NC}"
            echo -e "  brew install minio/stable/mc"
            return 1
        fi
        echo -e "${GREEN}MinIO Client 安装成功${NC}"
    else
        echo -e "${GREEN}MinIO Client 已安装${NC}"
    fi
    return 0
}

# 配置 MinIO Client
configure_mc() {
    echo -e "${YELLOW}配置 MinIO Client...${NC}"
    # 配置MinIO访问
    mc alias set local http://${MINIO_HOST}:${MINIO_PORT} ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}
    if [ $? -ne 0 ]; then
        echo -e "${RED}配置 MinIO Client 失败${NC}"
        return 1
    fi
    echo -e "${GREEN}MinIO Client 配置成功${NC}"
    return 0
}

# 创建Bucket（如果不存在）
create_bucket_if_not_exists() {
    # 检查bucket是否存在
    if ! mc ls local/${MINIO_BUCKET} &> /dev/null; then
        echo -e "${YELLOW}创建 MinIO bucket: ${MINIO_BUCKET}${NC}"
        mc mb local/${MINIO_BUCKET}
        if [ $? -ne 0 ]; then
            echo -e "${RED}创建 bucket 失败${NC}"
            return 1
        fi
        
        # 设置bucket为公开可读
        echo -e "${YELLOW}设置 bucket 为公开可读${NC}"
        mc policy set download local/${MINIO_BUCKET}
        if [ $? -ne 0 ]; then
            echo -e "${RED}设置 bucket 策略失败${NC}"
            return 1
        fi
    else
        echo -e "${GREEN}MinIO bucket ${MINIO_BUCKET} 已存在${NC}"
    fi
    return 0
}

# 上传静态文件
upload_static_files() {
    if [ ! -d "$ICON_DIR" ]; then
        echo -e "${RED}错误: 目录不存在: ${ICON_DIR}${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}上传静态文件到 MinIO...${NC}"
    
    # 查找所有图片文件
    find "$ICON_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" \) | while read file; do
        # 获取文件名作为对象键名
        rel_path=${file##*/}
        
        # 检查文件是否已存在于 MinIO 中
        if mc stat "local/${MINIO_BUCKET}/default_icon/$rel_path" &> /dev/null; then
            echo -e "${YELLOW}文件已存在，跳过上传: default_icon/$rel_path${NC}"
            continue
        fi
        
        # 上传文件到default_icon/路径下
        echo -e "上传: $rel_path 到 default_icon/$rel_path"
        mc cp "$file" "local/${MINIO_BUCKET}/default_icon/$rel_path"
        if [ $? -ne 0 ]; then
            echo -e "${RED}上传文件失败: $rel_path${NC}"
        else
            echo -e "${GREEN}文件上传成功: $rel_path${NC}"
        fi
    done
    
    echo -e "${GREEN}静态文件上传完成${NC}"
}

echo -e "${YELLOW}开始初始化静态资源...${NC}"

# 检查MinIO Client
check_mc_cli || return 1

# 配置MinIO环境
configure_mc || return 1

# 创建bucket
create_bucket_if_not_exists || return 1

# 上传静态文件
upload_static_files

echo -e "${GREEN}静态资源初始化完成${NC}"

