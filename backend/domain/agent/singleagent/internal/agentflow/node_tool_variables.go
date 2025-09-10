/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package agentflow

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"sort"
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/components/tool/utils"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/variables"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/kvmemory"
	"github.com/coze-dev/coze-studio/backend/api/model/data/variable/project_memory"
	crossvariables "github.com/coze-dev/coze-studio/backend/crossdomain/contract/variables"
	"github.com/coze-dev/coze-studio/backend/domain/agent/singleagent/entity"
	"github.com/coze-dev/coze-studio/backend/infra/contract/embedding"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)


type variableConf struct {
	Agent                 *entity.SingleAgent
	UserID                string
	ConnectorID           int64
	DocumentMemoryService DocumentMemoryService // 文档记忆服务接口
	Embedder              embedding.Embedder
}

func loadAgentVariables(ctx context.Context, vc *variableConf) (map[string]string, error) {
	vbs := make(map[string]string)

	vb, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        conv.Int64ToStr(vc.Agent.AgentID),
		Version:      vc.Agent.Version,
		ConnectorUID: vc.UserID,
		ConnectorID:  vc.ConnectorID,
	}, nil)

	if err != nil {
		return nil, err
	}
	if len(vb) > 0 {
		for _, v := range vb {
			vbs[v.Keyword] = v.Value
		}
	}
	return vbs, nil
}

func newAgentVariableTools(ctx context.Context, v *variableConf) ([]tool.InvokableTool, error) {
	tools := make([]tool.InvokableTool, 0, 3) // 增加工具数量

	a := &avTool{
		Agent:                 v.Agent,
		UserID:                v.UserID,
		ConnectorID:           v.ConnectorID,
		avs:                   make(map[string]string), // 初始化缓存
		documentMemoryService: v.DocumentMemoryService,
		embedder:              v.Embedder,
	}

	// 🔥 获取用户的全部已存储记忆（全局+局部）
	allStoredMemories, err := a.loadAllStoredMemories(ctx)
	if err != nil {
		// 如果获取失败，仍然继续，不影响工具注册
		allStoredMemories = make(map[string]string)
	}

	// 初始化缓存
	a.avs = allStoredMemories

	// 标准记忆分类和变量命名规范
	standardCategories := map[string][]string{
		"个人信息": {"user_name", "age", "gender", "location", "occupation", "phone", "email"},
		"偏好设置": {"favorite_color", "favorite_food", "favorite_music", "preferred_style", "favorite_movie", "favorite_book"},
		"兴趣爱好": {"hobbies", "interests", "skills", "sports", "favorite_activity", "weekend_activity"},
		"生活习惯": {"daily_routine", "work_schedule", "sleep_pattern", "exercise_habit", "diet_preference"},
		"工作学习": {"job_title", "company", "education", "learning_goals", "career_plan"},
		"关系社交": {"family_info", "friend_circle", "social_preference", "communication_style"},
	}

	// 构建智能记忆指导
	var memoryGuide string = "\n## 📋 Memory Management Guidelines:\n\n"

	// 添加标准分类指导
	memoryGuide += "### Standard Memory Categories & Keywords:\n"
	for category, keywords := range standardCategories {
		memoryGuide += fmt.Sprintf("**%s**: %s\n", category, fmt.Sprintf("%v", keywords))
	}

	// Note: We don't expose stored memory contents in the tool description
	// to ensure AI relies on actual tool results rather than description text
	if len(allStoredMemories) > 0 {
		memoryGuide += fmt.Sprintf("\n### 🎯 Memory Status: %d memories stored\n", len(allStoredMemories))
		memoryGuide += "**Use the getKeywordMemory tool to retrieve specific memories**\n"
	} else {
		memoryGuide += "\n### 🎯 Currently Stored Memories: None\n"
	}

	memoryGuide += "\n### 💡 Best Practices:\n"
	memoryGuide += "- Use standard keywords when possible for consistency\n"
	memoryGuide += "- For similar concepts, check existing memories first\n"
	memoryGuide += "- Group related information under appropriate categories\n"

	// setKeywordMemory 工具
	setDesc := `
## 🧠 Memory Storage Tool

### When to Use:
1. When user asks to remember, save, store, or memorize information about themselves
2. When user provides personal information, preferences, interests, or facts they want remembered
3. When user says things like "remember that I...", "my name is...", "I like...", "I prefer...", etc.

### How to Extract Information:
1. **Use Standard Keywords**: Check the memory categories below and use standard keywords when possible
2. **Store Rich Natural Language**: Values should be complete, searchable descriptions in natural language
3. **Include Context and Keywords**: Add both Chinese and English terms for better semantic search
4. **Keyword Extraction Examples**:
   - "我叫张三" → keyword: "user_name", value: "用户的名字是张三 (user's name is 张三, name/姓名)"
   - "我喜欢红色" → keyword: "favorite_color", value: "用户喜欢红色 (user likes red color, 颜色偏好/color preference)"
   - "我身高183厘米" → keyword: "height", value: "用户身高是183厘米 (user is 183cm tall, 身高/height)"
   - "我在上海工作" → keyword: "location", value: "用户在上海工作 (user works in Shanghai, 工作地点/work location)"

### Important Rules:
- **Priority**: Use standard keywords from categories below when applicable
- **Natural Language Values**: Always store complete sentences that describe the information
- **Searchable Content**: Include both Chinese and English terms in values for better search
- **One Key Per Concept**: Each concept uses only ONE keyword with a comprehensive value
- **Update Policy**: New information should REPLACE the entire value for the same keyword
- **Examples**:
  - ✅ CORRECT: keyword="favorite_food", value="用户喜欢吃苹果、香蕉、猕猴桃 (user likes apples, bananas, kiwi, 喜欢的食物/favorite food)"
  - ❌ WRONG: keyword="favorite_food", value="苹果" (too brief, not searchable)
  - ✅ CORRECT: keyword="height", value="用户身高是183厘米 (user is 183cm tall, 身高/height)"
  - ❌ WRONG: keyword="height", value="183" (no context, hard to search)` + memoryGuide

	setTool, err := utils.InferTool("setKeywordMemory", setDesc, a.Invoke)
	if err != nil {
		return nil, err
	}
	tools = append(tools, setTool)

	// getKeywordMemory 工具
	getDesc := `
## 🔍 Memory Retrieval Tool

### When to Use:
1. **MANDATORY**: When user asks about personal information - NEVER answer without checking first
2. **MANDATORY**: User asks "我的身高是多少" → MUST call getKeywordMemory with query="身高"
3. **MANDATORY**: Before saying "I don't know" about personal info - ALWAYS search memories first!
4. When user asks to retrieve, recall, or check previously stored memories
5. When user wants to know what information is stored about them

### How to Use:
- **To get ALL memories**: Leave query EMPTY ("")
- **To search semantically**: Use natural language query describing what you're looking for

### Usage Examples:
- **Get ALL memories**: query = "" (empty string)
- **Search for specific info**: Use the same words user mentioned in their question

### IMPORTANT:
- When user asks "所有记忆", "全部记忆", "all memories" → use query = ""
- When user asks about specific topics → use query = "user's exact words"

### Standard Memory Categories:
**个人信息**: name, age, gender, location, occupation, phone, email
**偏好设置**: favorite_color, favorite_food, favorite_music, preferred_style, favorite_movie, favorite_book
**兴趣爱好**: hobbies, interests, skills, sports, favorite_activity, weekend_activity
**生活习惯**: daily_routine, work_schedule, sleep_pattern, exercise_habit, diet_preference
**工作学习**: job_title, company, education, learning_goals, career_plan
**关系社交**: family_info, friend_circle, social_preference, communication_style`

	getTool, err := utils.InferTool("getKeywordMemory", getDesc, a.SimpleGetMemory)
	if err != nil {
		return nil, err
	}
	tools = append(tools, getTool)

	// searchMemory 工具 - 语义搜索记忆
	searchDesc := `
## 🔎 Smart Memory Search Tool

### When to Use:
1. **MANDATORY**: When user asks ANY question about personal information (身高、年龄、姓名、喜好等)
2. **MANDATORY**: Before answering ANY personal question, ALWAYS call this tool first
3. **MANDATORY**: User asks "我的身高是多少" → Try searchMemory with query="height" (English keywords often work better)
4. When user asks about topics that might relate to stored memories but doesn't specify exact keywords
5. When you need to find similar or related memories based on semantic meaning

### How It Works:
- Searches through stored memories using semantic similarity
- Finds memories that are contextually related to the query
- Helpful when exact keyword matching isn't sufficient

### Usage Examples:
- Query: "height" or "身高" → finds height information
- Query: "age" or "年龄" → finds age information
- Query: "name" or "姓名" → finds name information
- Query: "occupation" or "工作" → finds job information

### Search Strategy:
1. **First try English keywords**: height, age, name, gender, occupation, favorite_food, etc.
2. **If no results, try Chinese**: 身高, 年龄, 姓名, etc.
3. **If still no results, try broader terms**: personal, info, basic, etc.

### Important:
- Memory keywords are often stored in English (height, age, name, etc.)
- When user asks "我的身高是多少", try query="height" first

### Best Practices:
- Use descriptive queries that capture the semantic meaning
- Combine with getKeywordMemory for comprehensive memory retrieval
- Use when you want to discover related memories the user might not explicitly mention` + memoryGuide

	searchTool, err := utils.InferTool("searchMemory", searchDesc, a.SearchMemory)
	if err != nil {
		return nil, err
	}
	tools = append(tools, searchTool)

	// 🔥 新增：文档记忆工具
	if a.documentMemoryService != nil {
		// addDocumentMemory 工具
		addDocDesc := `
## 📝 Document Memory Storage Tool

### When to Use:
1. When user shares personal information, experiences, or context that should be remembered
2. When user expresses preferences, likes, dislikes, or personal details
3. When user mentions important life events, goals, or background information
4. When user wants their information to be remembered for future conversations

### How It Works:
- Stores information as complete text documents, not key-value pairs
- Maintains semantic searchable personal memory for the user
- Can store long-form content with rich context and relationships
- Automatically enabled if user expresses desire to be remembered

### Usage Examples:
- "我叫张三，今年25岁，住在北京，喜欢编程和旅游" → Store complete personal profile
- "我对红色过敏，不能穿红色衣服" → Store important health/preference information
- "我最近在学习Python，希望成为一名数据科学家" → Store learning goals and aspirations
- "我的生日是3月15日，最喜欢的菜是宫保鸡丁" → Store personal details

### Benefits:
- Rich contextual memory that maintains relationships between information
- Semantic search to find relevant context during conversations
- Natural language storage that preserves user's original expression
- Global memory that works across different conversations and agents`

		addDocTool, err := utils.InferTool("addDocumentMemory", addDocDesc, a.AddDocumentMemory)
		if err != nil {
			return nil, err
		}
		tools = append(tools, addDocTool)

		// searchDocumentMemory 工具
		searchDocDesc := `
## 🔍 Document Memory Search Tool

### When to Use:
1. When you need to recall user's personal information or context
2. When user asks about previously shared information
3. When user wants to know what you remember about them
4. When providing personalized responses based on user's background

### How It Works:
- Searches through user's complete memory document using semantic similarity
- Returns relevant context with surrounding information (10 lines above/below hits)
- Finds information even if query doesn't match exact words used originally

### Usage Examples:
- Search "favorite color" to find color preferences
- Search "work" to find job-related information
- Search "family" to find family-related context
- Search "health" to find health-related preferences or conditions

### Benefits:
- Contextual search that understands semantic meaning
- Returns surrounding context for better understanding
- Works with natural language queries
- Maintains user privacy by only accessing their own memory`

		searchDocTool, err := utils.InferTool("searchDocumentMemory", searchDocDesc, a.SearchDocumentMemory)
		if err != nil {
			return nil, err
		}
		tools = append(tools, searchDocTool)
	}

	// deleteKeywordMemory 工具 - 删除记忆
	deleteDesc := `
## 🗑️ Memory Delete Tool

### When to Use:
1. When user asks to delete, remove, or forget specific information
2. When user says things like "删除我的身高信息", "忘记我的年龄", "移除我的姓名"
3. When user wants to clear specific memories or correct wrong information
4. When user says "delete my height", "remove my age", "forget my name"

### How to Use:
- Specify the **keywords** of the memories to delete (e.g., ["height"], ["age"], ["user_name"])
- Use English keywords when possible (height, age, name, gender, occupation, etc.)
- You can delete multiple keywords at once by providing an array

### Usage Examples:
- User: "删除我的身高信息" → keywords: ["height"]
- User: "忘记我的年龄和性别" → keywords: ["age", "gender"]
- User: "移除我的个人信息" → keywords: ["user_name", "age", "gender", "height"]
- User: "清除我的喜好设置" → keywords: ["favorite_food", "favorite_color", "favorite_music"]

### Important:
- **Be careful**: Deletion is permanent and cannot be undone
- **Confirm with user** if the deletion request is unclear
- **Use exact keywords** that exist in memory (check with searchMemory first if unsure)` + memoryGuide

	deleteTool, err := utils.InferTool("deleteKeywordMemory", deleteDesc, a.DeleteKeywordMemory)
	if err != nil {
		return nil, err
	}
	tools = append(tools, deleteTool)

	return tools, nil
}

type avTool struct {
	Agent                 *entity.SingleAgent
	UserID                string
	ConnectorID           int64
	avs                   map[string]string      // 变量缓存
	documentMemoryService DocumentMemoryService // 文档记忆服务接口
	embedder              embedding.Embedder
}

type KVMeta struct {
	Keyword string `json:"keyword" jsonschema:"required,description=the keyword of memory variable"`
	Value   string `json:"value" jsonschema:"required,description=the value of memory variable"`
}
type KVMemoryVariable struct {
	Data []*KVMeta `json:"data"`
}


func (a *avTool) Invoke(ctx context.Context, v *KVMemoryVariable) (string, error) {
	logs.CtxInfof(ctx, "SetMemory: called with data=%+v", v)

	// 🔥 智能分层存储：AI提取的动态变量存储为全局记忆
	// 所有通过工具调用存储的变量都视为AI提取的动态变量，应该存储为全局记忆
	globalMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        a.UserID, // 🔥 使用外部API的user_id作为BizID实现全局共享
		Version:      "",        // 全局记忆不需要版本隔离
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	logs.CtxInfof(ctx, "SetMemory: using GLOBAL meta - BizType=%d, BizID=%s, Version=%s, ConnectorUID=%s, ConnectorID=%d",
		globalMeta.BizType, globalMeta.BizID, globalMeta.Version, globalMeta.ConnectorUID, globalMeta.ConnectorID)

	var items []*kvmemory.KVItem
	if v != nil {
		for _, item := range v.Data {
			items = append(items, &kvmemory.KVItem{
				Keyword: item.Keyword,
				Value:   item.Value,
			})
		}
		if len(items) > 0 {
			logs.CtxInfof(ctx, "SetMemory: storing %d items: %+v", len(items), items)

			// 在存储前先查询一下当前已有的全局变量
			existingVars, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, globalMeta, nil)
			if err == nil {
				logs.CtxInfof(ctx, "SetMemory: existing GLOBAL variables before store: %+v", existingVars)
			}

			updatedKeys, err := crossvariables.DefaultSVC().SetVariableInstance(ctx, globalMeta, items)
			if err != nil {
				logs.CtxErrorf(ctx, "setVariableInstance failed, err=%v", err)
				return "fail", nil
			}

			// 🔥 关键修复：存储成功后清理冲突的局部记忆
			// 避免局部记忆覆盖全局记忆的最新数据
			logs.CtxInfof(ctx, "SetMemory: successfully stored to GLOBAL memory, updated keys: %+v", updatedKeys)

			// 🔥 重要：删除局部记忆中的同名变量，避免数据冲突
			if len(updatedKeys) > 0 {
				localMeta := &variables.UserVariableMeta{
					BizType:      project_memory.VariableConnector_Bot,
					BizID:        conv.Int64ToStr(a.Agent.AgentID),
					Version:      a.Agent.Version,
					ConnectorUID: a.UserID,
					ConnectorID:  a.ConnectorID,
				}

				// 为每个更新的关键词删除对应的局部记忆
				for _, keyword := range updatedKeys {
					err := crossvariables.DefaultSVC().DeleteVariableInstance(ctx, localMeta, keyword)
					if err != nil {
						// 删除失败不影响主流程，只记录日志
						logs.CtxWarnf(ctx, "SetMemory: failed to delete conflicting local memory for keyword=%s, err=%v", keyword, err)
					} else {
						logs.CtxInfof(ctx, "SetMemory: cleaned up conflicting local memory for keyword=%s", keyword)
					}
				}

				// 验证全局存储是否成功
				newVars, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, globalMeta, nil)
				if err == nil {
					logs.CtxInfof(ctx, "SetMemory: verification - GLOBAL variables after store: %+v", newVars)
				} else {
					logs.CtxErrorf(ctx, "SetMemory: failed to verify storage, err=%v", err)
				}
			}
		} else {
			logs.CtxWarnf(ctx, "SetMemory: no items to store")
		}
	} else {
		logs.CtxWarnf(ctx, "SetMemory: received nil data")
	}

	return "success", nil
}

// SimpleGetMemoryRequest 简单获取记忆的请求结构，匹配模型传递的JSON格式
type SimpleGetMemoryRequest struct {
	Query string `json:"query" jsonschema:"description=semantic query to search for related memories. If empty, retrieve all variables"`
}

// SimpleGetMemory 简单获取关键字记忆，匹配模型传递的参数格式
func (a *avTool) SimpleGetMemory(ctx context.Context, req *SimpleGetMemoryRequest) (string, error) {
	// 强制调试日志
	fmt.Printf("🔥 SimpleGetMemory: METHOD CALLED! req=%+v\n", req)
	logs.CtxInfof(ctx, "🔥 SimpleGetMemory: METHOD CALLED! req=%+v", req)

	// 🔥 关键修复：每次检索都重新获取最新数据，不依赖缓存
	// 这样可以确保获取到最新的记忆数据，解决缓存不同步问题

	// 1. 全局记忆Meta（AI提取的动态变量）
	globalMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        a.UserID, // 使用外部API的user_id
		Version:      "",        // 全局记忆不需要版本隔离
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	// 2. 局部记忆Meta（用户显式设置的变量）
	localMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        conv.Int64ToStr(a.Agent.AgentID),
		Version:      a.Agent.Version,
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	// if query is empty, get all
	if req == nil || req.Query == "" {
		logs.CtxInfof(ctx, "SimpleGetMemory: empty query, getting all memories")

		globalItems, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, globalMeta, nil)
		if err != nil {
			logs.CtxErrorf(ctx, "SimpleGetMemory: get GLOBAL memory failed, err=%v", err)
			globalItems = nil // 忽略全局记忆错误，继续获取局部记忆
		}

		localItems, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, localMeta, nil)
		if err != nil {
			logs.CtxErrorf(ctx, "SimpleGetMemory: get LOCAL memory failed, err=%v", err)
			localItems = nil // 忽略局部记忆错误
		}

		// 🔥 第三步：合并全局和局部记忆（去重，局部记忆优先级更高）
		mergedItems := make(map[string]*kvmemory.KVItem)

		// 先加入全局记忆
		for _, item := range globalItems {
			mergedItems[item.Keyword] = item
		}

		// 再加入局部记忆（会覆盖同名的全局记忆）
		for _, item := range localItems {
			mergedItems[item.Keyword] = item
		}

		// 转换为数组
		var items []*kvmemory.KVItem
		for _, item := range mergedItems {
			items = append(items, item)
		}

		// 构建响应数据
		var data []*KVMeta
		for _, item := range items {
			kvMeta := &KVMeta{
				Keyword: item.Keyword,
				Value:   item.Value,
			}
			data = append(data, kvMeta)
		}

		response := map[string]interface{}{
			"data": data,
		}

		jsonBytes, err := json.Marshal(response)
		if err != nil {
			logs.CtxErrorf(ctx, "SimpleGetMemory: JSON marshal failed, err=%v", err)
			return `{"data":null}`, nil
		}
		logs.CtxInfof(ctx, "SimpleGetMemory: returning all memories: %s", string(jsonBytes))
		return string(jsonBytes), nil
	}

	// Semantic search if query is not empty
	if a.embedder == nil {
		logs.CtxWarnf(ctx, "SimpleGetMemory: embedder not configured, cannot perform semantic search.")
		return `{"data":[]}`, nil
	}

	logs.CtxInfof(ctx, "SimpleGetMemory: performing semantic search for query: %s", req.Query)

	// 1. Get all memories
	globalItems, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, globalMeta, nil)
	if err != nil {
		logs.CtxErrorf(ctx, "SimpleGetMemory: get GLOBAL memory failed, err=%v", err)
	}
	localItems, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, localMeta, nil)
	if err != nil {
		logs.CtxErrorf(ctx, "SimpleGetMemory: get LOCAL memory failed, err=%v", err)
	}

	// 2. Merge memories
	mergedItems := make(map[string]*kvmemory.KVItem)
	for _, item := range globalItems {
		mergedItems[item.Keyword] = item
	}
	for _, item := range localItems {
		mergedItems[item.Keyword] = item
	}

	var allItems []*kvmemory.KVItem
	for _, item := range mergedItems {
		allItems = append(allItems, item)
	}

	if len(allItems) == 0 {
		return `{"data":[]}`, nil
	}

	// 3. Embed query and memory values
	queryEmbeddings, err := a.embedder.EmbedStrings(ctx, []string{req.Query})
	if err != nil {
		logs.CtxErrorf(ctx, "SimpleGetMemory: failed to embed query, err=%v", err)
		return `{"data":null}`, err
	}
	queryEmbedding := queryEmbeddings[0]

	memoryContents := make([]string, len(allItems))
	for i, item := range allItems {
		memoryContents[i] = item.Keyword + ": " + item.Value
	}

	memoryEmbeddings, err := a.embedder.EmbedStrings(ctx, memoryContents)
	if err != nil {
		logs.CtxErrorf(ctx, "SimpleGetMemory: failed to embed memories, err=%v", err)
		return `{"data":null}`, err
	}

	// 4. Calculate similarity and find top results
	type scoredItem struct {
		item  *kvmemory.KVItem
		score float64
	}

	var scoredItems []scoredItem
	for i, item := range allItems {
		if i >= len(memoryEmbeddings) {
			continue
		}
		score := cosineSimilarity(queryEmbedding, memoryEmbeddings[i])
		logs.CtxInfof(ctx, "SimpleGetMemory: item=%s:%s, score=%f", item.Keyword, item.Value, score)
		// Lower similarity threshold for better matching
		if score > 0.3 {
			scoredItems = append(scoredItems, scoredItem{item: item, score: score})
		}
	}

	// Sort by score
	sort.Slice(scoredItems, func(i, j int) bool {
		return scoredItems[i].score > scoredItems[j].score
	})

	// Take top 5
	if len(scoredItems) > 5 {
		scoredItems = scoredItems[:5]
	}

	// 5. Build response
	var data []*KVMeta
	for _, si := range scoredItems {
		data = append(data, &KVMeta{
			Keyword: si.item.Keyword,
			Value:   si.item.Value,
		})
	}

	response := map[string]interface{}{
		"data": data,
	}

	jsonBytes, err := json.Marshal(response)
	if err != nil {
		logs.CtxErrorf(ctx, "SimpleGetMemory: JSON marshal failed, err=%v", err)
		return `{"data":null}`, nil
	}

	logs.CtxInfof(ctx, "SimpleGetMemory: returning response: %s", string(jsonBytes))
	return string(jsonBytes), nil
}

func cosineSimilarity(v1, v2 []float64) float64 {
	if len(v1) != len(v2) || len(v1) == 0 {
		return 0.0
	}
	var dotProduct, normV1, normV2 float64
	for i := range v1 {
		dotProduct += v1[i] * v2[i]
		normV1 += v1[i] * v1[i]
		normV2 += v2[i] * v2[i]
	}
	if normV1 == 0 || normV2 == 0 {
		return 0.0
	}
	return dotProduct / (math.Sqrt(normV1) * math.Sqrt(normV2))
}

// GetMemoryRequest 获取记忆的请求结构
type GetMemoryRequest struct {
	Keywords []string `json:"keywords,omitempty" jsonschema:"description=specific keywords to retrieve. If empty, retrieve all variables"`
	Keyword  string   `json:"keyword,omitempty" jsonschema:"description=single keyword to retrieve. If empty, retrieve all variables"`
	GetAll   bool     `json:"get_all,omitempty" jsonschema:"description=set to true to retrieve all stored variables"`
}

// GetMemoryResponse 获取记忆的响应结构
type GetMemoryResponse struct {
	Data []*KVMeta `json:"data" jsonschema:"description=retrieved memory variables"`
}

// SearchMemoryRequest 搜索记忆的请求结构
type SearchMemoryRequest struct {
	Query string `json:"query" jsonschema:"required,description=semantic query to search for related memories, like 'color preferences', 'work info', 'hobbies', etc."`
}

// SearchMemoryResponse 搜索记忆的响应结构
type SearchMemoryResponse struct {
	Data []*KVMeta `json:"data" jsonschema:"description=memories found matching the semantic query"`
	MatchedCategories []string `json:"matched_categories,omitempty" jsonschema:"description=categories that matched the query"`
}

// DeleteKeywordMemoryRequest 删除记忆请求
type DeleteKeywordMemoryRequest struct {
	Keywords []string `json:"keywords" jsonschema:"description=Keywords of memories to delete (e.g., ['height', 'age'])"`
}

// DeleteKeywordMemoryResponse 删除记忆响应
type DeleteKeywordMemoryResponse struct {
	Success       bool     `json:"success" jsonschema:"description=whether the deletion was successful"`
	DeletedCount  int      `json:"deleted_count" jsonschema:"description=number of items successfully deleted"`
	DeletedItems  []string `json:"deleted_items" jsonschema:"description=list of keywords that were deleted"`
	NotFoundItems []string `json:"not_found_items,omitempty" jsonschema:"description=list of keywords that were not found"`
	Message       string   `json:"message" jsonschema:"description=human readable message about the deletion result"`
}

// GetMemory 获取关键字记忆
func (a *avTool) GetMemory(ctx context.Context, req *GetMemoryRequest) (*GetMemoryResponse, error) {
	// 强制调试日志
	fmt.Printf("🔥 GetMemory: METHOD CALLED! req=%+v\n", req)
	logs.CtxInfof(ctx, "🔥 GetMemory: METHOD CALLED! req=%+v", req)

	// 🔥 智能两层检索：同时检索全局记忆和局部记忆
	globalMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        a.UserID, // 使用外部API的user_id
		Version:      "",        // 全局记忆不需要版本隔离
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	localMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        conv.Int64ToStr(a.Agent.AgentID),
		Version:      a.Agent.Version,
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	// 构建要查询的关键字列表
	var keywords []string
	if req != nil {
		if req.GetAll {
			// 明确要求获取所有变量，keywords 保持为 nil
			keywords = nil
		} else if req.Keyword != "" {
			keywords = append(keywords, req.Keyword)
		} else if len(req.Keywords) > 0 {
			keywords = append(keywords, req.Keywords...)
		} else {
			// 如果没有指定任何关键字，默认获取所有变量
			keywords = nil
		}
	} else {
		// 如果请求为空，获取所有变量
		keywords = nil
	}

	logs.CtxInfof(ctx, "GetMemory: requesting keywords=%v for user=%s, agent=%s", keywords, a.UserID, conv.Int64ToStr(a.Agent.AgentID))

	// 🔥 两层检索：获取全局记忆和局部记忆，并合并结果
	globalItems, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, globalMeta, keywords)
	if err != nil {
		logs.CtxErrorf(ctx, "get global memory failed, err=%v", err)
		globalItems = nil
	}

	localItems, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, localMeta, keywords)
	if err != nil {
		logs.CtxErrorf(ctx, "get local memory failed, err=%v", err)
		localItems = nil
	}

	// 合并结果（去重，局部记忆优先级更高）
	mergedItems := make(map[string]*kvmemory.KVItem)
	// 先加入全局记忆
	for _, item := range globalItems {
		mergedItems[item.Keyword] = item
	}
	// 再加入局部记忆（会覆盖同名的全局记忆）
	for _, item := range localItems {
		mergedItems[item.Keyword] = item
	}

	// 转换为数组
	var items []*kvmemory.KVItem
	for _, item := range mergedItems {
		items = append(items, item)
	}

	logs.CtxInfof(ctx, "GetMemory: retrieved %d global + %d local = %d merged items",
		len(globalItems), len(localItems), len(items))

	// 转换为响应格式
	var data []*KVMeta
	for _, item := range items {
		data = append(data, &KVMeta{
			Keyword: item.Keyword,
			Value:   item.Value,
		})
	}

	return &GetMemoryResponse{Data: data}, nil
}

// SearchMemory 语义搜索记忆
func (a *avTool) SearchMemory(ctx context.Context, req *SearchMemoryRequest) (*SearchMemoryResponse, error) {
	if req == nil || req.Query == "" {
		return &SearchMemoryResponse{Data: []*KVMeta{}, MatchedCategories: []string{}}, nil
	}

	// 标准记忆分类（与工具注册时保持一致）
	standardCategories := map[string][]string{
		"个人信息": {"user_name", "age", "gender", "location", "occupation", "phone", "email"},
		"偏好设置": {"favorite_color", "favorite_food", "favorite_music", "preferred_style", "favorite_movie", "favorite_book"},
		"兴趣爱好": {"hobbies", "interests", "skills", "sports", "favorite_activity", "weekend_activity"},
		"生活习惯": {"daily_routine", "work_schedule", "sleep_pattern", "exercise_habit", "diet_preference"},
		"工作学习": {"job_title", "company", "education", "learning_goals", "career_plan"},
		"关系社交": {"family_info", "friend_circle", "social_preference", "communication_style"},
	}

	// 🔥 两层检索：同时检索全局记忆和局部记忆
	globalMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        a.UserID, // 使用外部API的user_id
		Version:      "",        // 全局记忆不需要版本隔离
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	localMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        conv.Int64ToStr(a.Agent.AgentID),
		Version:      a.Agent.Version,
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	// 获取全局和局部所有变量，然后合并
	globalItems, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, globalMeta, nil)
	if err != nil {
		logs.CtxErrorf(ctx, "SearchMemory: get global memory failed, err=%v", err)
		globalItems = nil
	}

	localItems, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, localMeta, nil)
	if err != nil {
		logs.CtxErrorf(ctx, "SearchMemory: get local memory failed, err=%v", err)
		localItems = nil
	}

	// 合并结果（去重，局部记忆优先级更高）
	mergedItems := make(map[string]*kvmemory.KVItem)
	for _, item := range globalItems {
		mergedItems[item.Keyword] = item
	}
	for _, item := range localItems {
		mergedItems[item.Keyword] = item // 覆盖同名的全局记忆
	}

	// 转换为数组以便后续搜索
	var allItems []*kvmemory.KVItem
	for _, item := range mergedItems {
		allItems = append(allItems, item)
	}

	logs.CtxInfof(ctx, "SearchMemory: merged %d global + %d local = %d items for search",
		len(globalItems), len(localItems), len(allItems))

	query := strings.ToLower(req.Query)
	matchedItems := make([]*KVMeta, 0)
	matchedCategories := make(map[string]bool)

	// 语义搜索逻辑
	for _, item := range allItems {
		keyword := strings.ToLower(item.Keyword)
		value := strings.ToLower(item.Value)

		// 1. 直接关键词匹配
		if strings.Contains(keyword, query) || strings.Contains(value, query) {
			matchedItems = append(matchedItems, &KVMeta{
				Keyword: item.Keyword,
				Value:   item.Value,
			})

			// 找到对应的分类
			for category, keywords := range standardCategories {
				for _, stdKeyword := range keywords {
					if item.Keyword == stdKeyword {
						matchedCategories[category] = true
						break
					}
				}
			}
			continue
		}

		// 2. 类别语义匹配
		categoryMatched := false
		for category, keywords := range standardCategories {
			categoryLower := strings.ToLower(category)

			// 检查查询是否与分类相关
			if strings.Contains(query, categoryLower) ||
			   strings.Contains(categoryLower, query) ||
			   a.isSemanticMatch(query, category) {

				// 检查该变量是否属于这个分类
				for _, stdKeyword := range keywords {
					if item.Keyword == stdKeyword {
						matchedItems = append(matchedItems, &KVMeta{
							Keyword: item.Keyword,
							Value:   item.Value,
						})
						matchedCategories[category] = true
						categoryMatched = true
						break
					}
				}
				if categoryMatched { break }
			}
		}

		if categoryMatched { continue }

		// 3. 关键词语义匹配
		for category, keywords := range standardCategories {
			for _, stdKeyword := range keywords {
				if item.Keyword == stdKeyword && a.isKeywordSemanticMatch(query, stdKeyword) {
					matchedItems = append(matchedItems, &KVMeta{
						Keyword: item.Keyword,
						Value:   item.Value,
					})
					matchedCategories[category] = true
					break
				}
			}
		}
	}

	// 转换匹配的分类为切片
	categories := make([]string, 0, len(matchedCategories))
	for category := range matchedCategories {
		categories = append(categories, category)
	}

	logs.CtxInfof(ctx, "SearchMemory: query=%s, found %d items in categories: %v", req.Query, len(matchedItems), categories)

	return &SearchMemoryResponse{
		Data: matchedItems,
		MatchedCategories: categories,
	}, nil
}

// DeleteKeywordMemory 删除指定关键词的记忆
func (a *avTool) DeleteKeywordMemory(ctx context.Context, req *DeleteKeywordMemoryRequest) (*DeleteKeywordMemoryResponse, error) {
	if req == nil || len(req.Keywords) == 0 {
		return &DeleteKeywordMemoryResponse{
			Success: false,
			Message: "No keywords provided for deletion",
		}, nil
	}

	logs.CtxInfof(ctx, "DeleteKeywordMemory: deleting keywords %v", req.Keywords)

	// 使用现有的删除API - 参考现有的实现
	// 构建局部记忆的删除请求
	localMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        a.UserID, // 使用 UserID 作为 BizID
		Version:      "",
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	// 循环删除每个关键词（API只支持单个关键词删除）
	deletedItems := []string{}
	notFoundItems := []string{}

	for _, keyword := range req.Keywords {
		err := crossvariables.DefaultSVC().DeleteVariableInstance(ctx, localMeta, keyword)
		if err != nil {
			logs.CtxWarnf(ctx, "DeleteKeywordMemory: failed to delete %s: %v", keyword, err)
			notFoundItems = append(notFoundItems, keyword)
		} else {
			logs.CtxInfof(ctx, "DeleteKeywordMemory: successfully deleted %s", keyword)
			deletedItems = append(deletedItems, keyword)
		}
	}

	success := len(deletedItems) > 0
	message := fmt.Sprintf("Deleted %d items", len(deletedItems))
	if len(notFoundItems) > 0 {
		message += fmt.Sprintf(", %d items not found: %s", len(notFoundItems), strings.Join(notFoundItems, ", "))
	}

	return &DeleteKeywordMemoryResponse{
		Success:       success,
		DeletedCount:  len(deletedItems),
		DeletedItems:  deletedItems,
		NotFoundItems: notFoundItems,
		Message:       message,
	}, nil
}

// isSemanticMatch 检查语义匹配
func (a *avTool) isSemanticMatch(query, category string) bool {
	// 简单的语义匹配规则
	semanticMappings := map[string][]string{
		"个人信息": {"personal", "info", "profile", "basic", "个人", "信息", "基本", "身高", "年龄", "姓名", "性别", "height", "age", "name", "gender"},
		"偏好设置": {"preference", "favorite", "like", "love", "prefer", "偏好", "喜好", "最爱", "喜欢"},
		"兴趣爱好": {"hobby", "interest", "activity", "sport", "skill", "兴趣", "爱好", "活动", "技能"},
		"生活习惯": {"habit", "routine", "lifestyle", "daily", "生活", "习惯", "日常", "作息"},
		"工作学习": {"work", "job", "career", "study", "education", "learn", "工作", "学习", "教育", "职业"},
		"关系社交": {"social", "friend", "family", "relationship", "communication", "社交", "朋友", "家庭", "关系"},
	}

	if mappings, exists := semanticMappings[category]; exists {
		queryLower := strings.ToLower(query)
		for _, mapping := range mappings {
			if strings.Contains(queryLower, mapping) || strings.Contains(mapping, queryLower) {
				return true
			}
		}
	}
	return false
}

// isKeywordSemanticMatch 检查关键词语义匹配
func (a *avTool) isKeywordSemanticMatch(query, keyword string) bool {
	// 关键词语义映射
	keywordMappings := map[string][]string{
		"favorite_color": {"color", "颜色", "喜欢的颜色", "最爱颜色"},
		"favorite_food": {"food", "eat", "meal", "食物", "吃", "美食", "饮食", "fruit", "水果", "favorite_fruit"},
		"user_name": {"name", "姓名", "名字", "叫"},
		"location": {"where", "place", "city", "address", "位置", "地方", "城市", "住址"},
		"job_title": {"job", "work", "position", "职位", "工作", "职业"},
		"hobbies": {"hobby", "interest", "爱好", "兴趣"},
		"favorite_activity": {"activity", "do", "活动", "做什么", "爱好"},
		// 可以继续扩展...
	}

	if mappings, exists := keywordMappings[keyword]; exists {
		queryLower := strings.ToLower(query)
		for _, mapping := range mappings {
			if strings.Contains(queryLower, mapping) || strings.Contains(mapping, queryLower) {
				return true
			}
		}
	}
	return false
}

// expandSimilarKeywords 扩展语义相似的关键词（核心功能）
func (a *avTool) expandSimilarKeywords(inputKeyword string) []string {
	// 🔥 关键词语义映射表 - 支持双向映射
	keywordSynonyms := map[string][]string{
		// 食物相关
		"favorite_food":  {"favorite_fruit", "favorite_meal", "favorite_dish", "loved_food"},
		"favorite_fruit": {"favorite_food", "favorite_meal", "favorite_dish", "loved_food"},
		"favorite_meal":  {"favorite_food", "favorite_fruit", "favorite_dish", "loved_food"},
		"favorite_dish":  {"favorite_food", "favorite_fruit", "favorite_meal", "loved_food"},
		"loved_food":     {"favorite_food", "favorite_fruit", "favorite_meal", "favorite_dish"},

		// 颜色相关
		"favorite_color":  {"preferred_color", "loved_color", "like_color"},
		"preferred_color": {"favorite_color", "loved_color", "like_color"},
		"loved_color":     {"favorite_color", "preferred_color", "like_color"},
		"like_color":      {"favorite_color", "preferred_color", "loved_color"},

		// 活动相关
		"favorite_activity": {"hobby", "preferred_activity", "loved_activity", "favorite_hobby"},
		"preferred_activity": {"favorite_activity", "hobby", "loved_activity", "favorite_hobby"},
		"loved_activity":     {"favorite_activity", "hobby", "preferred_activity", "favorite_hobby"},
		"favorite_hobby":     {"favorite_activity", "hobby", "preferred_activity", "loved_activity"},
		"hobby":              {"favorite_activity", "preferred_activity", "loved_activity", "favorite_hobby"},

		// 名字相关
		"user_name":  {"name", "full_name", "real_name"},
		"name":       {"user_name", "full_name", "real_name"},
		"full_name":  {"user_name", "name", "real_name"},
		"real_name":  {"user_name", "name", "full_name"},

		// 位置相关
		"location":    {"address", "city", "place", "where_live"},
		"address":     {"location", "city", "place", "where_live"},
		"city":        {"location", "address", "place", "where_live"},
		"place":       {"location", "address", "city", "where_live"},
		"where_live":  {"location", "address", "city", "place"},

		// 工作相关
		"job_title":   {"work", "occupation", "position", "career"},
		"work":        {"job_title", "occupation", "position", "career"},
		"occupation":  {"job_title", "work", "position", "career"},
		"position":    {"job_title", "work", "occupation", "career"},
		"career":      {"job_title", "work", "occupation", "position"},
	}

	// 构建结果列表：原关键词 + 所有同义词
	result := []string{inputKeyword} // 首先包含原始关键词

	inputLower := strings.ToLower(inputKeyword)
	if synonyms, exists := keywordSynonyms[inputLower]; exists {
		result = append(result, synonyms...)
	}

	// 去重
	seen := make(map[string]bool)
	uniqueResult := []string{}
	for _, keyword := range result {
		if !seen[keyword] {
			seen[keyword] = true
			uniqueResult = append(uniqueResult, keyword)
		}
	}

	return uniqueResult
}

// loadAllStoredMemories 获取用户的所有已存储记忆，用于增强工具描述
func (a *avTool) loadAllStoredMemories(ctx context.Context) (map[string]string, error) {
	allMemories := make(map[string]string)

	// 获取全局记忆
	globalMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        a.UserID,
		Version:      "",
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	globalVars, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, globalMeta, nil)
	if err == nil {
		for _, v := range globalVars {
			allMemories[v.Keyword] = v.Value + " (全局)"
		}
	}

	// 获取局部记忆
	localMeta := &variables.UserVariableMeta{
		BizType:      project_memory.VariableConnector_Bot,
		BizID:        conv.Int64ToStr(a.Agent.AgentID),
		Version:      a.Agent.Version,
		ConnectorUID: a.UserID,
		ConnectorID:  a.ConnectorID,
	}

	localVars, err := crossvariables.DefaultSVC().GetVariableInstance(ctx, localMeta, nil)
	if err == nil {
		for _, v := range localVars {
			// 如果全局记忆中已有同名变量，局部记忆覆盖
			allMemories[v.Keyword] = v.Value + " (局部)"
		}
	}

	return allMemories, nil
}

// 🔥 文档记忆工具方法

// AddMemoryRequest 添加文档记忆请求
type AddMemoryRequest struct {
	Content string `json:"content" jsonschema:"required,description=the complete text content to store in document memory"`
}

// AddDocumentMemory 添加文档记忆
func (a *avTool) AddDocumentMemory(ctx context.Context, req *AddMemoryRequest) (string, error) {
	logs.CtxInfof(ctx, "🧠 AddDocumentMemory: called with content length=%d", len(req.Content))

	if a.documentMemoryService == nil {
		logs.CtxWarnf(ctx, "Document memory service not available")
		return "文档记忆服务不可用", nil
	}

	if req == nil || strings.TrimSpace(req.Content) == "" {
		logs.CtxWarnf(ctx, "AddDocumentMemory: empty content provided")
		return "内容为空，无法存储", nil
	}

	// 调用文档记忆服务
	err := a.documentMemoryService.AddMemory(ctx, a.UserID, a.ConnectorID, strings.TrimSpace(req.Content))
	if err != nil {
		logs.CtxErrorf(ctx, "AddDocumentMemory failed: %v", err)
		return fmt.Sprintf("存储失败：%v", err), nil
	}

	logs.CtxInfof(ctx, "🧠 AddDocumentMemory: successfully stored memory")
	return "已成功存储到您的记忆文档中", nil
}

// SearchMemoryRequest 搜索文档记忆请求
type SearchDocumentMemoryRequest struct {
	Query string `json:"query" jsonschema:"required,description=search query to find relevant information in user's memory document"`
}

// SearchDocumentMemory 搜索文档记忆
func (a *avTool) SearchDocumentMemory(ctx context.Context, req *SearchDocumentMemoryRequest) (string, error) {
	logs.CtxInfof(ctx, "🧠 SearchDocumentMemory: called with query=%s", req.Query)

	if a.documentMemoryService == nil {
		logs.CtxWarnf(ctx, "Document memory service not available")
		return "文档记忆服务不可用", nil
	}

	if req == nil || strings.TrimSpace(req.Query) == "" {
		logs.CtxWarnf(ctx, "SearchDocumentMemory: empty query provided")
		return "搜索关键词为空", nil
	}

	// 执行搜索
	results, err := a.documentMemoryService.SearchMemory(ctx, a.UserID, a.ConnectorID, strings.TrimSpace(req.Query))
	if err != nil {
		logs.CtxErrorf(ctx, "SearchDocumentMemory failed: %v", err)
		return fmt.Sprintf("搜索失败：%v", err), nil
	}

	if len(results) == 0 {
		logs.CtxInfof(ctx, "🧠 SearchDocumentMemory: no results found")
		return "未找到相关记忆信息", nil
	}

	// 构建搜索结果
	var resultText strings.Builder
	resultText.WriteString(fmt.Sprintf("找到 %d 个相关记忆片段：\n\n", len(results)))

	for i, result := range results {
		resultText.WriteString(fmt.Sprintf("【记忆片段 %d】\n", i+1))
		resultText.WriteString(fmt.Sprintf("%s\n\n", result))
	}

	logs.CtxInfof(ctx, "🧠 SearchDocumentMemory: returned %d results", len(results))
	return resultText.String(), nil
}
