# Dify 智能体接入指南

## 📝 快速开始

### 1. 获取 Dify API 信息

访问您的 Dify 平台，获取以下信息：
- **API 端点**：完整的 API URL，必须包含 `/v1/chat-messages` 路径
- **API 密钥**：以 `app-` 开头的密钥

示例：
```
API端点: https://ai.finmall.com/v1/chat-messages
API密钥: app-UZHHu47HfF1VL0HgdoJ0bjUT
```

### 2. 在 Coze Studio 中添加 Dify 智能体

1. 进入空间管理页面
2. 点击左侧菜单"外部智能体"
3. 点击"添加智能体"按钮
4. 填写配置：

| 字段 | 是否必填 | 说明 | 示例 |
|------|---------|------|------|
| 名称 | ✅ 必填 | 智能体显示名称 | `FinMall 智能助手` |
| 描述 | 可选 | 智能体功能说明 | `专业的金融知识问答助手` |
| 平台类型 | ✅ 必填 | 选择"Dify 智能体" | `dify` |
| API端点 | ✅ 必填 | **完整的 API 地址，必须包含 `/v1/chat-messages`** | `https://ai.finmall.com/v1/chat-messages` |
| API密钥 | ✅ 必填 | Dify 平台提供的密钥（以 `app-` 开头） | `app-UZHHu47HfF1VL0HgdoJ0bjUT` |
| 外部智能体ID | 可选 | 外部平台的智能体标识 | - |
| 应用ID | 可选 | 外部平台的应用标识 | - |

### 3. 在 Workflow 中使用

1. 创建或编辑 Workflow
2. 添加 LLM 节点
3. 在模型选择器中，找到"外部智能体"分组
4. 选择刚添加的 Dify 智能体
5. 保存并运行

## ⚠️ 常见问题

### Q1: API 端点应该填写什么？

⚠️ **重要**：Dify 和 HiAgent 的填写方式不同！

#### Dify 智能体

**错误示例** ❌：
```
https://ai.finmall.com
https://ai.finmall.com/v1  ← 缺少 /chat-messages
```

**正确示例** ✅：
```
https://ai.finmall.com/v1/chat-messages  ← 必须包含完整路径
```

**原因**：Dify 使用完整的 URL，后端代码中直接使用该地址，不会拼接额外路径。

**代码验证**（backend/domain/ynet_agent/dify_model.go:276）：
```go
req, err := http.NewRequestWithContext(ctx, "POST", d.agent.APIEndpoint, ...)
// 直接使用 d.agent.APIEndpoint，无路径拼接
```

#### HiAgent（火山引擎）

**正确示例** ✅：
```
https://api.volcengine.com/v1  ← 仅填写到 /v1
```

**原因**：HiAgent 后端会自动拼接 `/api/proxy/api/v1/chat_query_v2` 等路径。

**代码验证**（backend/domain/ynet_agent/hiagent_model.go:100, 486）：
```go
// 使用 buildEndpoint 函数拼接完整路径
endpoint := buildEndpoint(h.agent.Endpoint, "/api/proxy/api/v1/chat_query_v2")
endpoint := buildEndpoint(h.agent.Endpoint, "/api/proxy/api/v1/create_conversation")

// buildEndpoint 函数实现（第633行）：
func buildEndpoint(baseURL, path string) string {
    base := strings.TrimSuffix(baseURL, "/")
    p := strings.TrimPrefix(path, "/")
    return base + "/" + p
}
```

#### 对比总结

| 平台 | 用户填写 | 实际请求 URL |
|------|---------|-------------|
| **Dify** | `https://ai.finmall.com/v1/chat-messages` | `https://ai.finmall.com/v1/chat-messages`（直接使用） |
| **HiAgent** | `https://api.volcengine.com/v1` | `https://api.volcengine.com/v1/api/proxy/api/v1/chat_query_v2`（自动拼接） |

### Q2: API 密钥格式是什么？

Dify 的 API 密钥通常以 `app-` 开头，例如：
```
app-UZHHu47HfF1VL0HgdoJ0bjUT
app-xxx123yyy456zzz789
```

如果您的密钥不是以 `app-` 开头，请确认是否从正确的位置获取。

### Q3: 多轮对话上下文是如何保持的？

Dify 智能体的会话管理流程：

1. **第一次对话**：
   - 系统发送请求时，`conversation_id` 字段为空
   - Dify 返回新的 `conversation_id`
   - 系统自动保存到数据库

2. **后续对话**：
   - 系统从数据库加载 `conversation_id`
   - 使用该 ID 继续对话
   - Dify 自动维护上下文

3. **会话重置**：
   - 当 `section_id` 变化时（如切换对话）
   - 系统会清空旧的 `conversation_id`
   - 下次对话将创建新会话

### Q4: 如何测试是否配置成功？

1. 添加智能体后，检查列表中状态是否为"已启用"
2. 创建一个简单的 Workflow，只包含一个 LLM 节点
3. 选择刚添加的 Dify 智能体
4. 输入测试问题，如"你好"
5. 检查是否收到正常响应

### Q5: 支持流式输出吗？

✅ **完全支持**！系统会自动使用 Dify 的流式 API（`response_mode: "streaming"`），实时返回生成的文本。

## 🔧 高级配置

### 自定义 User ID

默认情况下，系统使用固定的 `user: "user-123"`。如果需要自定义，可以修改后端代码：

```go
// backend/domain/ynet_agent/dify_model.go
reqBody := DifyChatRequest{
    Query:          userMessage,
    Inputs:         make(map[string]interface{}),
    ResponseMode:   "streaming",
    ConversationID: conversationID,
    User:           "user-123", // 修改这里
}
```

### 平台检测逻辑

系统支持两种方式识别 Dify 平台：

1. **优先**：从 `metadata.platform` 字段读取
2. **降级**：根据 API 端点 URL 自动判断
   - 包含 `dify` 或 `finmall` → 识别为 Dify
   - 包含 `volcengine` 或 `hiagent` → 识别为 HiAgent

## 📊 数据库存储

会话信息存储在 `conversation` 表的 `ext` 字段中：

```json
{
  "hiagent_conversations": {
    "dify_agent_001": {
      "app_conversation_id": "e62a008c-60e5-4bdb-8638-4d6a15b02d09",
      "last_section_id": 7566455633650663424
    }
  }
}
```

注意：虽然字段名为 `hiagent_conversations`，但实际上存储的是所有外部智能体的会话信息（包括 Dify）。

## 🚀 API 请求示例

当您配置好 Dify 智能体后，系统会发送类似以下的请求：

```bash
curl --location --request POST 'https://ai.finmall.com/v1/chat-messages' \
--header 'Authorization: Bearer app-UZHHu47HfF1VL0HgdoJ0bjUT' \
--header 'Content-Type: application/json' \
--data-raw '{
    "inputs": {},
    "query": "你好，我叫陆志鹏",
    "response_mode": "streaming",
    "conversation_id": "",
    "user": "user-123"
}'
```

响应格式（SSE 流式）：

```
data: {"event": "message", "conversation_id": "e62a008c-60e5-4bdb-8638-4d6a15b02d09", "answer": "你好", ...}
data: {"event": "message", "conversation_id": "e62a008c-60e5-4bdb-8638-4d6a15b02d09", "answer": "，", ...}
data: {"event": "message", "conversation_id": "e62a008c-60e5-4bdb-8638-4d6a15b02d09", "answer": "陆志鹏", ...}
data: {"event": "message_end", ...}
```

## 📞 技术支持

遇到问题？检查以下日志：

1. **后端日志**：
   ```bash
   # 查看智能体创建日志
   grep "Detected platform" logs/backend.log

   # 查看 API 调用日志
   grep "calling dify stream API" logs/backend.log

   # 查看会话管理日志
   grep "extracted conversation_id" logs/backend.log
   ```

2. **前端控制台**：
   - 打开浏览器开发者工具
   - 查看 Network 标签页
   - 检查 `/api/space/{id}/hi-agents` 接口的请求和响应

## 🎯 性能优化建议

1. **会话复用**：在同一个对话 session 中，系统会自动复用 `conversation_id`，无需每次都创建新会话
2. **并发限制**：注意 Dify 平台的 API 调用限制，避免过快的并发请求
3. **超时设置**：流式请求不设置超时时间，确保长回复能够完整接收

## 📚 相关文档

- [Dify 官方文档](https://docs.dify.ai/)
- [外部智能体接入方案](./external-agent-integration-guide.md)
- [HiAgent 接入指南](./hiagent-guide.md)

---

**最后更新**: 2025-10-29
**版本**: v1.0
