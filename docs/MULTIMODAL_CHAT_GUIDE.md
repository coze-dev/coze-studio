# 多模态聊天 API 使用指南

本文档介绍如何使用 API Key 方式进行聊天对话，包括纯文本对话和多模态对话（文本+图片）。

## 目录

- [快速开始](#快速开始)
- [API 接口说明](#api-接口说明)
- [使用示例](#使用示例)
- [常见问题](#常见问题)

## 快速开始

### 前置要求

- **API Key**: 格式 `pat_xxxxx`
- **Bot ID**: 已发布的智能体 ID
- **Base URL**: API 服务地址

### 基本流程

**纯文本对话：**
```
创建会话 → 发送文本消息
```

**多模态对话（文本+图片）：**
```
上传图片 → 创建会话 → 发送多模态消息（必须包含文本+图片）
```

**注意事项：**
- 使用Base64上传方式（`/api/bot/upload_file`）更简单，适合小于5MB的图片
- 多模态消息**必须包含文本提示**，不支持纯图片输入
- 确保智能体使用支持视觉的模型（如 GPT-4o）

## API 接口说明

### 1. 创建会话

**端点：** `POST /v1/conversation/create`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| bot_id | string | 是 | 智能体 ID |

**响应字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| data.id | string | 会话 ID |

### 2. 发送聊天消息

**端点：** `POST /v3/chat`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| bot_id | string | 是 | 智能体 ID |
| conversation_id | string | 是 | 会话 ID |
| user_id | string | 是 | 用户标识 |
| stream | boolean | 否 | 是否流式返回 |
| additional_messages | array | 是 | 消息列表 |

**消息格式：**

```json
{
  "role": "user",
  "content": "消息内容",
  "content_type": "text"  // 纯文本用 "text"，多模态用 "object_string"
}
```

**多模态 content 格式：**

```json
"[{\"type\":\"text\",\"text\":\"文本内容\"},{\"type\":\"file\",\"file_url\":\"图片URL\"}]"
```

### 3. 上传图片文件（Base64方式）

**端点：** `POST /api/bot/upload_file`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file_head.file_type | string | 是 | 文件扩展名（jpg, png等） |
| file_head.biz_type | int | 是 | 业务类型（1=Bot图标） |
| data | string | 是 | Base64编码的文件内容 |

**响应字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| data.upload_url | string | 文件访问URL |
| data.upload_uri | string | 文件内部URI |

**使用示例：**

```bash
# 读取图片并Base64编码
BASE64_DATA=$(base64 -i "image.jpg" | tr -d '\n')

# 上传文件
curl -X POST "${BASE_URL}/api/bot/upload_file" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"file_head\": {
      \"file_type\": \"jpg\",
      \"biz_type\": 1
    },
    \"data\": \"${BASE64_DATA}\"
  }"
```

## 使用示例

### 示例 1: 纯文本对话

```bash
#!/bin/bash

BASE_URL="https://agents.finmall.com"
API_KEY="pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33"
BOT_ID="7535655495097384960"

# 步骤1: 创建会话
echo "创建会话..."
CONV_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/conversation/create" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"bot_id\": \"${BOT_ID}\"}")

CONVERSATION_ID=$(echo "$CONV_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
echo "会话ID: $CONVERSATION_ID"

# 步骤2: 发送文本消息
echo "发送消息..."
curl -X POST "${BASE_URL}/v3/chat" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"bot_id\": \"${BOT_ID}\",
    \"conversation_id\": \"${CONVERSATION_ID}\",
    \"user_id\": \"test_user\",
    \"stream\": false,
    \"additional_messages\": [
      {
        \"role\": \"user\",
        \"content\": \"你好，请帮我查询账户余额\",
        \"content_type\": \"text\"
      }
    ]
  }"
```

### 示例 2: 多模态对话（文本+图片）

```bash
#!/bin/bash

BASE_URL="https://agents.finmall.com"
API_KEY="pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33"
BOT_ID="7535655495097384960"
IMAGE_PATH="/path/to/your/image.jpg"

# 步骤1: 获取上传凭证
echo "获取上传凭证..."
FILE_SIZE=$(wc -c < "$IMAGE_PATH")
FILE_NAME=$(basename "$IMAGE_PATH")

AUTH_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/playground/upload/auth_token" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"file_size\": ${FILE_SIZE},
    \"file_name\": \"${FILE_NAME}\"
  }")

UPLOAD_URL=$(echo "$AUTH_RESPONSE" | grep -o '"upload_url":"[^"]*"' | sed 's/"upload_url":"//;s/"//' | sed 's/\\u0026/\&/g')
ACCESS_URL=$(echo "$AUTH_RESPONSE" | grep -o '"access_url":"[^"]*"' | sed 's/"access_url":"//;s/"//' | sed 's/\\u0026/\&/g')

echo "上传地址: $UPLOAD_URL"
echo "访问地址: $ACCESS_URL"

# 步骤2: 上传文件
echo "上传文件..."
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@${IMAGE_PATH}"

echo "文件上传完成"

# 步骤3: 创建会话
echo "创建会话..."
CONV_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/conversation/create" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"bot_id\": \"${BOT_ID}\"}")

CONVERSATION_ID=$(echo "$CONV_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//;s/"//')
echo "会话ID: $CONVERSATION_ID"

# 步骤4: 发送多模态消息（文本+图片）
echo "发送多模态消息（文本+图片）..."
curl -X POST "${BASE_URL}/v3/chat" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"bot_id\": \"${BOT_ID}\",
    \"conversation_id\": \"${CONVERSATION_ID}\",
    \"user_id\": \"test_user\",
    \"stream\": false,
    \"additional_messages\": [
      {
        \"role\": \"user\",
        \"content\": \"[{\\\"type\\\":\\\"text\\\",\\\"text\\\":\\\"请描述这张图片的内容\\\"},{\\\"type\\\":\\\"file\\\",\\\"file_url\\\":\\\"${ACCESS_URL}\\\"}]\",
        \"content_type\": \"object_string\"
      }
    ]
  }"
```

### 示例 3: 图片分析（使用Base64上传）

```bash
#!/bin/bash

BASE_URL="https://agents.finmall.com"
API_KEY="pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33"
BOT_ID="7535655495097384960"
IMAGE_PATH="/path/to/your/image.jpg"

# 步骤1: Base64编码并上传文件
echo "步骤1: 上传图片..."
BASE64_DATA=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

UPLOAD_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/bot/upload_file" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"file_head\": {
      \"file_type\": \"jpg\",
      \"biz_type\": 1
    },
    \"data\": \"${BASE64_DATA}\"
  }")

FILE_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.data.upload_url')
echo "✓ 图片上传成功"
echo "  文件URL: $FILE_URL"

# 步骤2: 创建会话
echo "步骤2: 创建会话..."
CONV_RESPONSE=$(curl -s -X POST "${BASE_URL}/v1/conversation/create" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"bot_id\": \"${BOT_ID}\"}")

CONVERSATION_ID=$(echo "$CONV_RESPONSE" | jq -r '.data.id')
echo "✓ 会话ID: $CONVERSATION_ID"

# 步骤3: 发送图片分析消息（必须包含文本提示）
echo "步骤3: 发送图片分析请求..."
curl -X POST "${BASE_URL}/v3/chat" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"bot_id\": \"${BOT_ID}\",
    \"conversation_id\": \"${CONVERSATION_ID}\",
    \"user_id\": \"test_user\",
    \"stream\": false,
    \"additional_messages\": [
      {
        \"role\": \"user\",
        \"content\": \"[{\\\"type\\\":\\\"text\\\",\\\"text\\\":\\\"请描述这张图片的内容\\\"},{\\\"type\\\":\\\"file\\\",\\\"file_url\\\":\\\"${FILE_URL}\\\"}]\",
        \"content_type\": \"object_string\"
      }
    ]
  }"
```

### 响应格式说明

响应采用 Server-Sent Events (SSE) 流式格式：

```
event:conversation.chat.created
data:{"id":"xxx","conversation_id":"xxx",...}

event:conversation.message.delta
data:{"id":"xxx","content":"这是","content_type":"text",...}

event:conversation.message.delta
data:{"id":"xxx","content":"回复","content_type":"text",...}

event:conversation.message.completed
data:{"id":"xxx","content":"这是回复内容","content_type":"text",...}

event:conversation.chat.completed
data:{"id":"xxx","status":"completed",...}

event:conversation.stream.done
data:
```

## 常见问题

### 1. 多模态内容格式

**重要：** 多模态消息的 `content` 必须是 JSON 数组的字符串形式

**正确格式：**
```json
{
  "content": "[{\"type\":\"text\",\"text\":\"描述图片\"},{\"type\":\"file\",\"file_url\":\"https://...\"}]",
  "content_type": "object_string"
}
```

**错误格式：**
```json
{
  "content": [{"type":"text","text":"描述图片"}],  // ❌ 不能是对象
  "content_type": "object_string"
}
```

### 2. 图片 URL 使用

- 使用 `access_url` 字段作为图片访问地址
- 图片 URL 有有效期（通常 7 天）
- 确保 URL 中的 `&` 符号正确处理

### 3. 文件上传方式选择

| 文件大小 | 推荐方式 | 接口 | 说明 |
|---------|---------|------|------|
| < 5MB | Base64 直接上传 | `/api/bot/upload_file` | 推荐，简单快捷 |
| 5-100MB | 临时凭证上传 | `/api/playground/upload/auth_token` | 适合大文件 |

**本文档主要使用Base64上传方式**，更详细的上传方式请参考 [API上传指南](./API_UPLOAD_GUIDE.md)

### 4. 认证问题

- API Key 格式：`Authorization: Bearer pat_xxxxx`
- 确保 API Key 有对应权限
- 检查 Bot ID 是否已发布

### 5. 智能体多模态支持

如果智能体返回"无法查看图片"或内部错误：
- 检查智能体是否使用支持视觉的模型（如 GPT-4 Vision、GPT-4o）
- 确认智能体配置中启用了多模态功能
- **重要限制**：OpenAI视觉模型**不支持纯图片输入**（没有任何文本），必须包含文本提示词
  - ❌ 错误：只发送图片 `[{"type":"file","file_url":"..."}]`
  - ✅ 正确：图片+文本 `[{"type":"text","text":"请描述这张图片"},{"type":"file","file_url":"..."}]`
- 建议始终为图片添加明确的提示词，如"请描述这张图片"、"分析图片内容"等

## 测试配置

```bash
BASE_URL="https://agents.finmall.com"
API_KEY="pat_a6721931ccf78645b8726bd103e7db6f831c7c057e74164976e316b41a878a33"
BOT_ID="7535655495097384960"
SPACE_ID="7533521629687578624"
```

## 相关文档

- [API 上传指南](./API_UPLOAD_GUIDE.md) - 文件上传接口详细说明

## 技术支持

如有问题，请联系技术支持团队。
