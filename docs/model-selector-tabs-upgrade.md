# LLM节点模型选择器Tab分离改进

## 📋 改进概述

将LLM节点的模型选择器从2个tab（标准模型、HiAgent）升级为3个独立的tab：
- **标准模型** - 系统内置的AI模型
- **HiAgent** - 火山引擎HiAgent平台的外部智能体
- **Dify** - Dify平台的外部智能体

## 🎯 改进目标

### 问题背景
原来的实现中，HiAgent和Dify智能体都混在"HiAgent" tab中，无法区分：
- 用户体验混乱，不知道哪些是HiAgent，哪些是Dify
- 无法针对不同平台提供差异化的UI提示
- 不便于未来扩展其他平台（如百度文心、阿里通义等）

### 解决方案
按平台类型分离为独立的tab，每个平台有专属的选择器组件：
- 清晰的平台区分
- 独立的智能体列表（按platform字段过滤）
- 独立的配置选项和帮助提示
- 易于扩展新平台

## 📂 修改文件清单

### 1. 类型定义更新
**文件**: `frontend/packages/workflow/playground/src/typing/index.ts`

```typescript
export interface IModelValue {
  modelName?: string;
  modelType?: number;
  generationDiversity?: GenerationDiversity;
  responseFormat?: ResponseFormat;

  // External agent fields (HiAgent, Dify, etc.)
  isHiagent?: boolean; // 兼容旧字段，表示使用外部智能体
  externalAgentPlatform?: 'hiagent' | 'dify'; // 🆕 外部智能体平台类型
  hiagentId?: string; // 外部智能体ID（通用）
  hiagentSpaceId?: string; // 空间ID（通用）
  hiagentConversationMapping?: boolean; // 会话管理开关（通用）

  [k: string]: unknown;
}
```

**关键变化**:
- 新增 `externalAgentPlatform` 字段，用于区分外部智能体平台类型
- 保留 `isHiagent` 字段用于向后兼容
- 复用 `hiagentId`、`hiagentSpaceId` 等字段（适用于所有外部智能体平台）

### 2. 新建DifySelector组件
**文件**: `frontend/packages/workflow/playground/src/nodes-v2/llm/dify-selector/index.tsx`

**功能**:
- 从API获取智能体列表，只显示 `platform === 'dify'` 的智能体
- 智能体下拉选择
- 会话管理复选框
- 选中后显示智能体详情卡片

**关键代码**:
```typescript
// 过滤只显示Dify平台的智能体
const difyOnly = (response.agents as DifyAgentItem[]).filter(agent => {
  return agent.platform === 'dify';
});

// 设置平台标识
onChange({
  ...value,
  isHiagent: true,
  externalAgentPlatform: 'dify',  // 标记为Dify平台
  hiagentId: agent.agent_id || agent.id,
  hiagentSpaceId: spaceId,
  modelName: agent.name,
});
```

### 3. 修改HiAgentSelector组件
**文件**: `frontend/packages/workflow/playground/src/nodes-v2/llm/hiagent-selector/index.tsx`

**变化**:
1. 添加 `platform` 字段到接口定义
2. 过滤只显示HiAgent平台的智能体（向后兼容没有platform字段的旧数据）
3. 在onChange中添加平台标识

**关键代码**:
```typescript
// 过滤只显示HiAgent平台的智能体
const hiagentOnly = (response.agents as HiAgentItem[]).filter(agent => {
  // 如果没有platform字段，默认为hiagent（向后兼容）
  return !agent.platform || agent.platform === 'hiagent';
});

// 设置平台标识
onChange({
  ...value,
  isHiagent: true,
  externalAgentPlatform: 'hiagent',  // 标记为HiAgent平台
  hiagentId: agent.agent_id || agent.id,
  hiagentSpaceId: spaceId,
  modelName: agent.name,
});
```

### 4. 修改ModelSelect主组件
**文件**: `frontend/packages/workflow/playground/src/components/model-select/index.tsx`

**变化**:
1. 导入DifySelector组件
2. 修改activeTab状态管理逻辑，支持3个tab
3. 添加Dify tab到Tabs组件
4. 修改tab切换逻辑，清除切换时的旧数据
5. 修改渲染逻辑，根据activeTab渲染不同的选择器

**关键改动**:

```typescript
// 1. 使用_value（原始值）而不是computed value
const [activeTab, setActiveTab] = useState(() => {
  if (!_value?.isHiagent) return 'standard';
  return _value?.externalAgentPlatform === 'dify' ? 'dify' : 'hiagent';
});

useEffect(() => {
  if (!_value?.isHiagent) {
    setActiveTab('standard');
  } else {
    setActiveTab(_value?.externalAgentPlatform === 'dify' ? 'dify' : 'hiagent');
  }
}, [_value?.isHiagent, _value?.externalAgentPlatform]);

// 2. Tab定义
<Tabs.TabPane tab={I18n.t('标准模型')} key="standard" />
<Tabs.TabPane tab="HiAgent" key="hiagent" />
<Tabs.TabPane tab="Dify" key="dify" />  {/* 🆕 新增 */}

// 3. Tab切换时清除旧数据
onChange={key => {
  setActiveTab(key);
  if (key === 'hiagent') {
    onChange?.({
      isHiagent: true,
      externalAgentPlatform: 'hiagent',
      hiagentConversationMapping: true,
      modelName: undefined,
      modelType: undefined,
      hiagentId: undefined,  // 清除选择
      hiagentSpaceId: undefined,
    });
  } else if (key === 'dify') {
    onChange?.({
      isHiagent: true,
      externalAgentPlatform: 'dify',
      hiagentConversationMapping: true,
      modelName: undefined,
      modelType: undefined,
      hiagentId: undefined,  // 清除选择
      hiagentSpaceId: undefined,
    });
  } else {
    // 标准模型...
  }
}}

// 4. 条件渲染
{activeTab === 'standard' ? (
  <ModelSelector ... />
) : activeTab === 'hiagent' ? (
  <HiAgentSelector value={value} onChange={onChange} readonly={readonly} />
) : (
  <DifySelector value={value} onChange={onChange} readonly={readonly} />
)}
```

## 🔄 数据流转

### 1. Tab切换流程
```
用户点击Tab → onChange触发 → 清除旧数据 → 设置新平台标识 → 更新activeTab状态
```

### 2. 智能体选择流程
```
组件加载 → 调用GetHiAgentList API → 按platform字段过滤 → 渲染下拉列表 → 用户选择 → onChange更新值
```

### 3. 数据保存结构
```json
{
  "isHiagent": true,
  "externalAgentPlatform": "dify",  // 或 "hiagent"
  "hiagentId": "dify_agent_001",
  "hiagentSpaceId": "7532755646102372352",
  "modelName": "FinMall 智能助手",
  "hiagentConversationMapping": true
}
```

## ✅ 兼容性保证

### 向后兼容
1. **旧数据识别**: 如果智能体没有`platform`字段，默认归类为HiAgent
2. **字段复用**: 继续使用`hiagentId`等字段名，避免破坏现有数据结构
3. **isHiagent标志**: 保留该字段用于判断是否为外部智能体

### 后端API兼容
- 后端已有`platform`字段（`HiAgentInfo.Platform`）
- 前端TypeScript类型已同步（`platform: string`）
- GetHiAgentList API返回所有平台的智能体，前端负责过滤

## 🎨 用户体验改进

### Before (2个Tab)
```
[标准模型] [HiAgent]
            ↓
     所有外部智能体混在一起
     用户无法区分平台
```

### After (3个Tab)
```
[标准模型] [HiAgent] [Dify]
            ↓         ↓
         只显示     只显示
      HiAgent平台   Dify平台
        的智能体     的智能体
```

## 🚀 未来扩展

添加新平台（如百度文心）非常简单：

1. 在`IModelValue`中添加新平台类型：
```typescript
externalAgentPlatform?: 'hiagent' | 'dify' | 'wenxin';
```

2. 创建新的Selector组件：
```typescript
// wenxin-selector/index.tsx
const wenxinOnly = agents.filter(a => a.platform === 'wenxin');
```

3. 在ModelSelect中添加Tab：
```typescript
<Tabs.TabPane tab="文心一言" key="wenxin" />
```

4. 添加条件渲染：
```typescript
: activeTab === 'wenxin' ? (
  <WenxinSelector ... />
) : ...
```

## 🧪 测试建议

### 功能测试
1. **Tab切换测试**
   - 在3个tab之间来回切换
   - 验证每次切换后，上一个tab的数据被清除
   - 验证activeTab状态正确

2. **智能体过滤测试**
   - 添加HiAgent智能体，验证只在HiAgent tab显示
   - 添加Dify智能体，验证只在Dify tab显示
   - 验证旧数据（无platform字段）显示在HiAgent tab

3. **数据保存测试**
   - 选择HiAgent，保存workflow，验证数据结构正确
   - 选择Dify，保存workflow，验证`externalAgentPlatform`为'dify'
   - 切换回标准模型，验证外部智能体字段被清除

### 边界测试
1. 空列表处理：无任何HiAgent/Dify时显示空状态
2. 权限测试：readonly模式下禁用选择
3. 加载状态：API调用期间显示loading状态

## 📊 性能影响

- **API调用**: 仍然只调用一次GetHiAgentList，前端过滤
- **渲染性能**: 增加一个tab和一个Selector组件，影响可忽略
- **包体积**: 新增约200行代码（DifySelector），影响微小

## ⚠️ 注意事项

1. **平台字段必填**: 新添加的外部智能体必须设置`platform`字段
2. **数据清理**: 切换tab时会清除选择，用户需重新选择智能体
3. **类型安全**: 使用TypeScript严格类型检查，避免运行时错误

## 📝 相关文档

- [Dify智能体接入指南](./dify-agent-guide.md)
- [外部智能体集成方案](./external-agent-integration-guide.md)

---

**更新时间**: 2025-10-29
**版本**: v1.0
**影响范围**: 前端LLM节点模型选择器
