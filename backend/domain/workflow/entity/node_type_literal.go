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

package entity

import (
	"github.com/coze-dev/coze-studio/backend/pkg/i18n"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ternary"
)

var Categories = []Category{
	{
		Key:      "", // this is the default category. some of the most important nodes belong here, such as LLM, plugin, sub-workflow
		Name:     "",
		EnUSName: "",
	},
	{
		Key:      "logic",
		Name:     "业务逻辑",
		EnUSName: "Logic",
	},
	{
		Key:      "input&output",
		Name:     "输入&输出",
		EnUSName: "Input&Output",
	},
	{
		Key:      "database",
		Name:     "数据库",
		EnUSName: "Database",
	},
	{
		Key:      "data",
		Name:     "知识库&数据",
		EnUSName: "Data",
	},
	{
		Key:      "image",
		Name:     "图像处理",
		EnUSName: "Image",
	},
	{
		Key:      "audio&video",
		Name:     "音视频处理",
		EnUSName: "Audio&Video",
	},
	{
		Key:      "utilities",
		Name:     "组件",
		EnUSName: "Utilities",
	},
	{
		Key:      "conversation_management",
		Name:     "会话管理",
		EnUSName: "Conversation management",
	},
	{
		Key:      "conversation_history",
		Name:     "会话历史",
		EnUSName: "Conversation history",
	},
	{
		Key:      "message",
		Name:     "消息",
		EnUSName: "Message",
	},
}

// NodeTypeMetas holds the metadata for all available node types.
// It is initialized with built-in types and potentially extended by loading from external sources.
var NodeTypeMetas = []*NodeTypeMeta{
	{
		ID:           1,
		Name:         "开始",
		Type:         NodeTypeEntry,
		Category:     "input&output", // Mapped from cate_list
		Desc:         "工作流的起始节点，用于设定启动工作流需要的信息",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Start",
		EnUSDescription: "The starting node of the workflow, used to set the information needed to initiate the workflow.",
	},
	{
		ID:           2,
		Name:         "结束",
		Type:         NodeTypeExit,
		Category:     "input&output", // Mapped from cate_list
		Desc:         "工作流的最终节点，用于返回工作流运行后的结果信息",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			PreFillZero:          true,
			CallbackEnabled:      true,
			InputSourceAware:     true,
			StreamingParadigms:   map[StreamingParadigm]bool{Invoke: true, Transform: true},
			StreamSourceEOFAware: true,
			IncrementalOutput:    true,
		},
		EnUSName:        "End",
		EnUSDescription: "The final node of the workflow, used to return the result information after the workflow runs.",
	},
	{
		ID:           3,
		Name:         "大模型",
		Type:         NodeTypeLLM,
		Category:     "", // Mapped from cate_list
		Desc:         "调用大语言模型,使用变量和提示词生成回复",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LLM-v2.jpg",
		SupportBatch: true, // supportBatch: 2
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   3 * 60 * 1000, // 3 minutes
			PreFillZero:        true,
			PostFillNil:        true,
			CallbackEnabled:    true,
			InputSourceAware:   true,
			MayUseChatModel:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true, Stream: true},
		},
		EnUSName:        "LLM",
		EnUSDescription: "Invoke the large language model, generate responses using variables and prompt words.",
	},

	{
		ID:           4,
		Name:         "插件",
		Type:         NodeTypePlugin,
		Category:     "", // Mapped from cate_list
		Desc:         "通过添加工具访问实时数据和执行外部操作",
		Color:        "#CA61FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Plugin-v2.jpg",
		SupportBatch: true, // supportBatch: 2
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   3 * 60 * 1000, // 3 minutes
			PreFillZero:        true,
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Plugin",
		EnUSDescription: "Used to access external real-time data and perform operations",
	},
	{
		ID:           5,
		Name:         "代码",
		Type:         NodeTypeCodeRunner,
		Category:     "logic", // Mapped from cate_list
		Desc:         "编写代码，处理输入变量来生成返回值",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Code-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Code",
		EnUSDescription: "Write code to process input variables to generate return values.",
	},
	{
		ID:           6,
		Name:         "知识库检索",
		Type:         NodeTypeKnowledgeRetriever,
		Category:     "data", // Mapped from cate_list
		Desc:         "在选定的知识中,根据输入变量召回最匹配的信息,并以列表形式返回",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-KnowledgeQuery-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Knowledge retrieval",
		EnUSDescription: "In the selected knowledge, the best matching information is recalled based on the input variable and returned as an Array.",
	},
	{
		ID:           8,
		Name:         "选择器",
		Type:         NodeTypeSelector,
		Category:     "logic", // Mapped from cate_list
		Desc:         "连接多个下游分支，若设定的条件成立则仅运行对应的分支，若均不成立则只运行“否则”分支",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Condition-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Condition",
		EnUSDescription: "Connect multiple downstream branches. Only the corresponding branch will be executed if the set conditions are met. If none are met, only the 'else' branch will be executed.",
	},
	{
		ID:           9,
		Name:         "工作流",
		Type:         NodeTypeSubWorkflow,
		Category:     "", // Mapped from cate_list
		Desc:         "集成已发布工作流，可以执行嵌套子任务",
		Color:        "#00B83E",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Workflow-v2.jpg",
		SupportBatch: true, // supportBatch: 2
		ExecutableMeta: ExecutableMeta{
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Workflow",
		EnUSDescription: "Add published workflows to execute subtasks",
	},
	{
		ID:           12,
		Name:         "SQL自定义",
		Type:         NodeTypeDatabaseCustomSQL,
		Category:     "database", // Mapped from cate_list
		Desc:         "基于用户自定义的 SQL 完成对数据库的增删改查操作",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Database-v2.jpg",
		SupportBatch: false, // supportBatch: 2
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "SQL Customization",
		EnUSDescription: "Complete the operations of adding, deleting, modifying and querying the database based on user-defined SQL",
	},
	{
		ID:           13,
		Name:         "输出",
		Type:         NodeTypeOutputEmitter,
		Category:     "input&output", // Mapped from cate_list
		Desc:         "节点从“消息”更名为“输出”，支持中间过程的消息输出，支持流式和非流式两种方式",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Output-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			PreFillZero:          true,
			CallbackEnabled:      true,
			InputSourceAware:     true,
			StreamingParadigms:   map[StreamingParadigm]bool{Invoke: true, Stream: true},
			StreamSourceEOFAware: true,
			IncrementalOutput:    true,
		},
		EnUSName:        "Output",
		EnUSDescription: "The node is renamed from \"message\" to \"output\", Supports message output in the intermediate process and streaming and non-streaming methods",
	},
	{
		ID:           15,
		Name:         "文本处理",
		Type:         NodeTypeTextProcessor,
		Category:     "utilities", // Mapped from cate_list
		Desc:         "用于处理多个字符串类型变量的格式",
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-StrConcat-v2.jpg",
		SupportBatch: false, // supportBatch: 2
		ExecutableMeta: ExecutableMeta{
			PreFillZero:        true,
			CallbackEnabled:    true,
			InputSourceAware:   true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Text Processing",
		EnUSDescription: "The format used for handling multiple string-type variables.",
	},
	{
		ID:           18,
		Name:         "问答",
		Type:         NodeTypeQuestionAnswer,
		Category:     "utilities", // Mapped from cate_list
		Desc:         "支持中间向用户提问问题,支持预置选项提问和开放式问题提问两种方式",
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Direct-Question-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			CallbackEnabled:    true,
			MayUseChatModel:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Question",
		EnUSDescription: "Support asking questions to the user in the middle of the conversation, with both preset options and open-ended questions",
	},
	{
		ID:           19,
		Name:         "终止循环",
		Type:         NodeTypeBreak,
		Category:     "logic", // Mapped from cate_list
		Desc:         "用于立即终止当前所在的循环，跳出循环体",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Break-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Break",
		EnUSDescription: "Used to immediately terminate the current loop and jump out of the loop",
	},
	{
		ID:           20,
		Name:         "设置变量",
		Type:         NodeTypeVariableAssignerWithinLoop,
		Category:     "logic", // Mapped from cate_list
		Desc:         "用于重置循环变量的值，使其下次循环使用重置后的值",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LoopSetVariable-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Set Variable",
		EnUSDescription: "Used to reset the value of the loop variable so that it uses the reset value in the next iteration",
	},
	{
		ID:           21,
		Name:         "循环",
		Type:         NodeTypeLoop,
		Category:     "logic", // Mapped from cate_list
		Desc:         "用于通过设定循环次数和逻辑，重复执行一系列任务",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Loop-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			IsComposite:        true,
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Loop",
		EnUSDescription: "Used to repeatedly execute a series of tasks by setting the number of iterations and logic",
	},
	{
		ID:           22,
		Name:         "意图识别",
		Type:         NodeTypeIntentDetector,
		Category:     "logic", // Mapped from cate_list
		Desc:         "用于用户输入的意图识别，并将其与预设意图选项进行匹配。",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Intent-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			CallbackEnabled:    true,
			MayUseChatModel:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Intent recognition",
		EnUSDescription: "Used for recognizing the intent in user input and matching it with preset intent options.",
	},
	{
		ID:           27,
		Name:         "知识库写入",
		Type:         NodeTypeKnowledgeIndexer,
		Category:     "data", // Mapped from cate_list
		Desc:         "写入节点可以添加 文本类型 的知识库，仅可以添加一个知识库",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-KnowledgeWriting-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Knowledge writing",
		EnUSDescription: "The write node can add a knowledge base of type text. Only one knowledge base can be added.",
	},
	{
		ID:           28,
		Name:         "批处理",
		Type:         NodeTypeBatch,
		Category:     "logic", // Mapped from cate_list
		Desc:         "通过设定批量运行次数和逻辑，运行批处理体内的任务",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Batch-v2.jpg",
		SupportBatch: false, // supportBatch: 1 (Corrected from previous assumption)
		ExecutableMeta: ExecutableMeta{
			IsComposite:        true,
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Batch",
		EnUSDescription: "By setting the number of batch runs and logic, run the tasks in the batch body.",
	},
	{
		ID:           29,
		Name:         "继续循环",
		Type:         NodeTypeContinue,
		Category:     "logic", // Mapped from cate_list
		Desc:         "用于终止当前循环，执行下次循环",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Continue-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Continue",
		EnUSDescription: "Used to immediately terminate the current loop and execute next loop",
	},
	{
		ID:           30,
		Name:         "输入",
		Type:         NodeTypeInputReceiver,
		Category:     "input&output", // Mapped from cate_list
		Desc:         "支持中间过程的信息输入",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Input-v2.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			PostFillNil:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Input",
		EnUSDescription: "Support intermediate information input",
	},
	{
		ID:           31,
		Name:         "注释",
		Type:         "",
		Category:     "",             // Not found in cate_list
		Desc:         "comment_desc", // Placeholder from JSON
		Color:        "",
		IconURL:      "comment_icon", // Placeholder from JSON
		SupportBatch: false,          // supportBatch: 1
		EnUSName:     "Comment",
	},
	{
		ID:           32,
		Name:         "变量聚合",
		Type:         NodeTypeVariableAggregator,
		Category:     "logic", // Mapped from cate_list
		Desc:         "对多个分支的输出进行聚合处理",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/VariableMerge-icon.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			PostFillNil:        true,
			CallbackEnabled:    true,
			InputSourceAware:   true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true, Transform: true},
		},
		EnUSName:        "Variable Merge",
		EnUSDescription: "Aggregate the outputs of multiple branches.",
	},
	{
		ID:           37,
		Name:         "查询消息列表",
		Type:         NodeTypeMessageList,
		Category:     "message", // Mapped from cate_list
		Desc:         "用于查询消息列表",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-List.jpeg",
		SupportBatch: false, // supportBatch: 1
		Disabled:     true,
		ExecutableMeta: ExecutableMeta{
			PreFillZero:        true,
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Query message list",
		EnUSDescription: "Used to query the message list",
	},
	{
		ID:           38,
		Name:         "清除上下文",
		Type:         NodeTypeClearMessage,
		Category:     "conversation_history", // Mapped from cate_list
		Desc:         "用于清空会话历史，清空后LLM看到的会话历史为空",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-Delete.jpeg",
		SupportBatch: false, // supportBatch: 1
		Disabled:     true,
		ExecutableMeta: ExecutableMeta{
			PreFillZero:        true,
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Clear conversation history",
		EnUSDescription: "Used to clear conversation history. After clearing, the conversation history visible to the LLM node will be empty.",
	},
	{
		ID:           39,
		Name:         "创建会话",
		Type:         NodeTypeCreateConversation,
		Category:     "conversation_management", // Mapped from cate_list
		Desc:         "用于创建会话",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-Create.jpeg",
		SupportBatch: false, // supportBatch: 1
		Disabled:     true,
		ExecutableMeta: ExecutableMeta{
			PreFillZero:        true,
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Create conversation",
		EnUSDescription: "This node is used to create a conversation.",
	},
	{
		ID:           40,
		Name:         "变量赋值",
		Type:         NodeTypeVariableAssigner,
		Category:     "data", // Mapped from cate_list
		Desc:         "用于给支持写入的变量赋值，包括应用变量、用户变量",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/Variable.jpg",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Variable assign",
		EnUSDescription: "Assigns values to variables that support the write operation, including app and user variables.",
	},
	{
		ID:           42,
		Name:         "更新数据",
		Type:         NodeTypeDatabaseUpdate,
		Category:     "database", // Mapped from cate_list
		Desc:         "修改表中已存在的数据记录，用户指定更新条件和内容来更新数据",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-update.jpg", // Corrected Icon URL from JSON
		SupportBatch: false,                                                                                                               // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Update Data",
		EnUSDescription: "Modify the existing data records in the table, and the user specifies the update conditions and contents to update the data",
	},
	{
		ID:           43,
		Name:         "查询数据", // Corrected Name from JSON (was "insert data")
		Type:         NodeTypeDatabaseQuery,
		Category:     "database",                        // Mapped from cate_list
		Desc:         "从表获取数据，用户可定义查询条件、选择列等，输出符合条件的数据", // Corrected Desc from JSON
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icaon-database-select.jpg", // Corrected Icon URL from JSON
		SupportBatch: false,                                                                                                                // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Query Data",
		EnUSDescription: "Query data from the table, and the user can define query conditions, select columns, etc., and output the data that meets the conditions",
	},
	{
		ID:           44,
		Name:         "删除数据",
		Type:         NodeTypeDatabaseDelete,
		Category:     "database",                     // Mapped from cate_list
		Desc:         "从表中删除数据记录，用户指定删除条件来删除符合条件的记录", // Corrected Desc from JSON
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-delete.jpg", // Corrected Icon URL from JSON
		SupportBatch: false,                                                                                                               // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Delete Data",
		EnUSDescription: "Delete data records from the table, and the user specifies the deletion conditions to delete the records that meet the conditions",
	},
	{
		ID:           45,
		Name:         "HTTP 请求",
		Type:         NodeTypeHTTPRequester,
		Category:     "utilities",         // Mapped from cate_list
		Desc:         "用于发送API请求，从接口返回数据", // Corrected Desc from JSON
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-HTTP.png", // Corrected Icon URL from JSON
		SupportBatch: false,                                                                                                    // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "HTTP request",
		EnUSDescription: "It is used to send API requests and return data from the interface.",
	},
	{
		ID:           46,
		Name:         "新增数据", // Corrected Name from JSON (was "Query Data")
		Type:         NodeTypeDatabaseInsert,
		Category:     "database",                 // Mapped from cate_list
		Desc:         "向表添加新数据记录，用户输入数据内容后插入数据库", // Corrected Desc from JSON
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-insert.jpg", // Corrected Icon URL from JSON
		SupportBatch: false,                                                                                                               // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Add Data",
		EnUSDescription: "Add new data records to the table, and insert them into the database after the user enters the data content",
	},
	{
		ID:           58,
		Name:         "JSON 序列化",
		Type:         NodeTypeJsonSerialization,
		Category:     "utilities",
		Desc:         "用于把变量转化为JSON字符串",
		Color:        "F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-to_json.png",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "JSON serialization",
		EnUSDescription: "Convert variable to JSON string",
	},
	{
		ID:           59,
		Name:         "JSON 反序列化",
		Type:         NodeTypeJsonDeserialization,
		Category:     "utilities",
		Desc:         "用于将JSON字符串解析为变量",
		Color:        "F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-from_json.png",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			CallbackEnabled:    true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "JSON deserialization",
		EnUSDescription: "Parse JSON string to variable",
	},
	{
		ID:           60,
		Name:         "知识库删除",
		Type:         NodeTypeKnowledgeDeleter,
		Category:     "data", // Mapped from cate_list
		Desc:         "用于删除知识库中的文档",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icons-dataset-delete.png",
		SupportBatch: false, // supportBatch: 1
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS:   60 * 1000, // 1 minute
			PreFillZero:        true,
			PostFillNil:        true,
			StreamingParadigms: map[StreamingParadigm]bool{Invoke: true},
		},
		EnUSName:        "Knowledge delete",
		EnUSDescription: "The delete node can delete a document in knowledge base.",
	},
	// --- End of nodes parsed from template_list ---
}

// PluginNodeMetas holds metadata for specific plugin API entity.
var PluginNodeMetas []*PluginNodeMeta

// PluginCategoryMetas holds metadata for plugin category entity.
var PluginCategoryMetas []*PluginCategoryMeta

func NodeMetaByNodeType(t NodeType) *NodeTypeMeta {
	for _, meta := range NodeTypeMetas {
		if meta.Type == t {
			return meta
		}
	}

	return nil
}

const defaultZhCNInitCanvasJsonSchema = `{
 "nodes": [
  {
   "id": "100001",
   "type": "1",
   "meta": {
    "position": {
     "x": 0,
     "y": 0
    }
   },
   "data": {
    "nodeMeta": {
     "description": "工作流的起始节点，用于设定启动工作流需要的信息",
     "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start.png",
     "subTitle": "",
     "title": "开始"
    },
    "outputs": [
     {
      "type": "string",
      "name": "input",
      "required": false
     }
    ],
    "trigger_parameters": [
     {
      "type": "string",
      "name": "input",
      "required": false
     }
    ]
   }
  },
  {
   "id": "900001",
   "type": "2",
   "meta": {
    "position": {
     "x": 1000,
     "y": 0
    }
   },
   "data": {
    "nodeMeta": {
     "description": "工作流的最终节点，用于返回工作流运行后的结果信息",
     "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End.png",
     "subTitle": "",
     "title": "结束"
    },
    "inputs": {
     "terminatePlan": "returnVariables",
     "inputParameters": [
      {
       "name": "output",
       "input": {
        "type": "string",
        "value": {
         "type": "ref",
         "content": {
          "source": "block-output",
          "blockID": "",
          "name": ""
         }
        }
       }
      }
     ]
    }
   }
  }
 ],
 "edges": [],
 "versions": {
  "loop": "v2"
 }
}`

const defaultEnUSInitCanvasJsonSchema = `{
 "nodes": [
  {
   "id": "100001",
   "type": "1",
   "meta": {
    "position": {
     "x": 0,
     "y": 0
    }
   },
   "data": {
    "nodeMeta": {
     "description": "The starting node of the workflow, used to set the information needed to initiate the workflow.",
     "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start.png",
     "subTitle": "",
     "title": "Start"
    },
    "outputs": [
     {
      "type": "string",
      "name": "input",
      "required": false
     }
    ],
    "trigger_parameters": [
     {
      "type": "string",
      "name": "input",
      "required": false
     }
    ]
   }
  },
  {
   "id": "900001",
   "type": "2",
   "meta": {
    "position": {
     "x": 1000,
     "y": 0
    }
   },
   "data": {
    "nodeMeta": {
     "description": "The final node of the workflow, used to return the result information after the workflow runs.",
     "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End.png",
     "subTitle": "",
     "title": "End"
    },
    "inputs": {
     "terminatePlan": "returnVariables",
     "inputParameters": [
      {
       "name": "output",
       "input": {
        "type": "string",
        "value": {
         "type": "ref",
         "content": {
          "source": "block-output",
          "blockID": "",
          "name": ""
         }
        }
       }
      }
     ]
    }
   }
  }
 ],
 "edges": [],
 "versions": {
  "loop": "v2"
 }
}`

func GetDefaultInitCanvasJsonSchema(locale i18n.Locale) string {
	return ternary.IFElse(locale == i18n.LocaleEN, defaultEnUSInitCanvasJsonSchema, defaultZhCNInitCanvasJsonSchema)
}
