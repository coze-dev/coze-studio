# SingleAgent 集成测试指南

## ✅ 已完成的开发工作

### 前端部分 (100% 完成)

#### 1. 类型定义扩展
**文件**: `frontend/packages/workflow/playground/src/typing/index.ts`
- ✅ 在 `IModelValue` 接口中添加 `'singleagent'` 到 `externalAgentPlatform`
- ✅ 添加 `singleagentId?: string` 字段（大整数字符串）

#### 2. SingleAgentSelector 组件
**文件**: `frontend/packages/workflow/playground/src/nodes-v2/llm/singleagent-selector/index.tsx`
- ✅ 创建完整的 190 行组件
- ✅ 调用 `/api/intelligence_api/search/get_draft_intelligence_list` API
- ✅ 过滤 `type=1`（SingleAgent 类型）和 `status=[1,3,4]`（可用状态）
- ✅ 保持 ID 为字符串格式（避免 JavaScript 精度丢失）
- ✅ 显示智能体图标、名称、发布状态

#### 3. ModelSelect 组件更新
**文件**: `frontend/packages/workflow/playground/src/components/model-select/index.tsx`
- ✅ 添加第 4 个 Tab："内部智能体"
- ✅ 更新 `activeTab` 类型支持 `'singleagent'`
- ✅ 添加 tab 切换逻辑（清除旧字段）
- ✅ 添加条件渲染显示 `SingleAgentSelector`

#### 4. 表单配置更新
**文件**: `frontend/packages/workflow/playground/src/nodes-v2/llm/llm-form-meta.tsx`
- ✅ 更新 subtitle 生成逻辑，显示 "内部智能体: {name}"

**文件**: `frontend/packages/workflow/playground/src/nodes-v2/llm/utils.ts`
- ✅ 添加 `singleagentId` 字段序列化为 `BlockInput.createString`

### 后端部分 (100% 完成)

#### 1. 参数结构扩展
**文件**: `backend/api/model/crossdomain/modelmgr/modelmgr.go`
```go
// SingleAgent specific field
SingleagentID string `json:"singleagentId,omitempty"` // 内部智能体ID（大整数字符串）
```

**文件**: `backend/domain/workflow/crossdomain/model/model.go`
```go
// SingleAgent specific field
SingleagentID string `json:"singleagentId,omitempty"` // 内部智能体ID（大整数字符串）
```

#### 2. 参数解析
**文件**: `backend/domain/workflow/internal/nodes/llm/llm.go`
- ✅ 添加 `singleagentId` case，解析字符串类型参数

#### 3. SingleAgentChatModel 实现
**文件**: `backend/domain/ynet_agent/singleagent_model.go` (新建)
- ✅ 实现 `BaseChatModel` 接口
- ✅ 实现 `Generate` 方法（同步调用）
- ✅ 实现 `Stream` 方法（流式调用）
- ✅ 当前返回占位符响应，便于测试参数传递

#### 4. 模型管理器集成
**文件**: `backend/crossdomain/impl/modelmgr/modelmgr.go`
- ✅ 在 `GetModel` 方法中添加 singleagent 检测分支
- ✅ 创建 `getSingleAgentModel` 方法
- ✅ 调用 `NewSingleAgentChatModel` 创建模型实例
- ✅ 复用 `hiAgentModelWrapper` 注入 ExecuteConfig

---

## 🧪 端到端测试步骤

### 前置准备

1. **确保有可用的 SingleAgent**
   ```bash
   # 在数据库中检查是否有 type=1 的 intelligence 记录
   # 或通过前端创建一个新的内部智能体
   ```

2. **启动后端服务**
   ```bash
   cd backend
   make server
   # 或
   go run main.go
   ```

3. **启动前端服务**
   ```bash
   cd frontend/apps/coze-studio
   npm run dev
   ```

### 测试场景 1: UI 显示验证

1. 打开 Workflow 编辑器
2. 添加或编辑 LLM 节点
3. **验证点**:
   - ✅ 应该看到 4 个 Tab: "标准模型"、"HiAgent"、"Dify"、"内部智能体"
   - ✅ 点击 "内部智能体" Tab
   - ✅ 应该看到 SingleAgent 选择器（下拉框）
   - ✅ 下拉框应该显示可用的内部智能体列表

### 测试场景 2: 选择 SingleAgent

1. 在 "内部智能体" Tab 中选择一个智能体
2. **验证点**:
   - ✅ 选择成功后，应该显示智能体的名称
   - ✅ 如果智能体已发布，应该显示 "已发布" 标签
   - ✅ 应该显示智能体的 ID 和描述

### 测试场景 3: 保存和加载配置

1. 选择一个 SingleAgent
2. 保存 Workflow
3. 刷新页面或重新打开 Workflow
4. **验证点**:
   - ✅ LLM 节点的卡片应该显示 "内部智能体: {智能体名称}"
   - ✅ 打开节点配置，应该仍然停留在 "内部智能体" Tab
   - ✅ 应该显示之前选择的智能体

### 测试场景 4: 参数传递验证

1. 选择一个 SingleAgent
2. 运行 Workflow（TestRun）
3. **验证点**:
   - ✅ 查看后端日志，应该看到：
     ```
     🔍 Creating SingleAgent model: agent_id=<ID>, model_name=<名称>
     ✅ Created SingleAgent model: agent_id=<ID>, name=<名称>
     🚀 SingleAgent Generate/Stream: agent_id=<ID>, query=<用户输入>
     ```
   - ✅ 前端应该收到占位符响应：
     ```
     [SingleAgent Placeholder] Received query: <用户输入>
     Agent ID: <ID>
     Agent Name: <名称>
     Note: SingleAgent internal execution logic is under development.
     ```

### 测试场景 5: Tab 切换验证

1. 先选择 "标准模型"，选择一个 LLM 模型
2. 切换到 "内部智能体" Tab
3. **验证点**:
   - ✅ 之前选择的 LLM 模型信息应该被清除
   - ✅ SingleAgent 选择器应该是空的（未选择状态）

4. 选择一个 SingleAgent
5. 切换回 "标准模型" Tab
6. **验证点**:
   - ✅ SingleAgent 信息应该被清除
   - ✅ 应该自动选择第一个可用的标准模型

---

## 🐛 常见问题排查

### 问题 1: 看不到 "内部智能体" Tab

**可能原因**:
- 前端代码未正确编译
- 浏览器缓存问题

**解决方案**:
```bash
# 清除前端缓存
cd frontend/apps/coze-studio
rm -rf node_modules/.cache
npm run dev
# 浏览器强制刷新 (Ctrl+Shift+R 或 Cmd+Shift+R)
```

### 问题 2: 下拉框为空或显示 "暂无可用的内部智能体"

**可能原因**:
- 数据库中没有 `type=1` 的 intelligence 记录
- intelligence 状态不在 `[1,3,4]` 范围内

**解决方案**:
```sql
-- 检查数据库
SELECT id, name, type, status
FROM intelligence
WHERE type = 1 AND status IN (1,3,4) AND deleted_at IS NULL;
```

### 问题 3: 选择后保存失败

**可能原因**:
- 参数序列化问题
- 后端参数解析失败

**检查点**:
1. 打开浏览器开发者工具 -> Network
2. 查看保存请求的 Payload
3. 确认 `llmParam` 中包含 `singleagentId` 字段
4. 查看后端日志是否有错误

### 问题 4: 运行时返回错误

**可能的错误信息**:
```
singleagent_id is required for SingleAgent
```

**解决方案**:
- 检查前端是否正确传递 `singleagentId`
- 检查参数序列化逻辑（utils.ts）

---

## 📊 测试检查清单

### 前端功能
- [ ] UI 显示正常（4个Tab）
- [ ] 下拉框正确显示 SingleAgent 列表
- [ ] 选择智能体后正确显示信息
- [ ] 保存配置成功
- [ ] 重新加载后配置保持
- [ ] Tab 切换时正确清除旧数据
- [ ] 节点卡片显示正确的 subtitle

### 后端功能
- [ ] 正确解析 `singleagentId` 参数
- [ ] 成功创建 `SingleAgentChatModel` 实例
- [ ] Generate 方法返回占位符响应
- [ ] Stream 方法返回流式占位符响应
- [ ] 日志输出正确的 agent_id 和 name

### 参数传递
- [ ] 前端正确序列化 `singleagentId` 为字符串
- [ ] 后端正确解析大整数字符串（无精度丢失）
- [ ] `externalAgentPlatform` 正确设置为 `'singleagent'`
- [ ] `isHiagent` 正确设置为 `true`（架构复用）

---

## 🚀 下一步开发计划

### 当前状态
✅ **基础架构完成** - 前端 UI 和后端参数传递链路已打通
⏳ **占位符实现** - 当前返回测试用的占位符响应

### 未来实现
要完成 SingleAgent 的**真正执行逻辑**，需要：

1. **集成 AgentFlow Runner**
   - 在 `singleagent_model.go` 的 `executeSingleAgentFlow` 方法中实现
   - 调用 `domain/agent/singleagent/internal/agentflow.BuildAgent`
   - 处理 `AgentRunner.StreamExecute` 的返回结果

2. **转换事件格式**
   - 将 `entity.AgentEvent` 转换为 `schema.Message`
   - 处理 tool calls、mid-answers 等事件

3. **会话管理**
   - 复用 Workflow 的 `ExecuteConfig.ConversationID`
   - 支持多轮对话的上下文传递

4. **错误处理**
   - 处理 Agent 执行失败的情况
   - 提供友好的错误提示

---

## 📝 测试报告模板

完成测试后，请填写以下信息：

### 测试环境
- 操作系统: _________
- Node.js 版本: _________
- Go 版本: _________
- 浏览器: _________

### 测试结果
- [ ] 所有前端功能正常
- [ ] 所有后端功能正常
- [ ] 参数传递正确
- [ ] 发现的问题: _________

### 日志片段
```
粘贴关键的后端日志输出
```

### 截图
- UI 截图
- 网络请求截图
- 日志截图

---

## 🎯 总结

本次开发已完成 **SingleAgent 集成的基础架构**：

✅ **前端**: 完整的 UI、组件、参数序列化
✅ **后端**: 参数结构、解析、模型创建、占位符实现
✅ **集成**: 参数传递链路完全打通

**当前状态**: 可以进行端到端测试，验证参数传递和基础功能
**下一步**: 实现真正的 SingleAgent 执行逻辑（调用 AgentFlow Runner）

祝测试顺利！🎉
