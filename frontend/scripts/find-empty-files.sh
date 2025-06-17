#!/bin/bash

# 需要搜索的目录
SEARCH_DIR=${1:-.}  # 默认目录为当前目录

# 检查输入参数
if [ -z "$SEARCH_DIR" ]; then
  echo "Usage: $0 <search_directory>"
  exit 1
fi

# 获取所有被 Git 跟踪的 .tsx 和 .less 文件
git ls-files --others --ignored --exclude-standard -o -c -- "$SEARCH_DIR" ':!*.tsx' ':!*.less' | while read -r FILE; do
  if [[ "$FILE" == *.tsx || "$FILE" == *.less ]]; then
    # 获取文件行数
    LINE_COUNT=$(wc -l < "$FILE")
    # 如果文件行数为空，删除文件并输出文件路径
    if [ "$LINE_COUNT" -eq 0 ]; then
      echo "Deleting empty file: $FILE"
      rm "$FILE"
    fi
  fi
done
