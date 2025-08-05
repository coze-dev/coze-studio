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
	"fmt"
	"strconv"
)

type NodeType string

func (nt NodeType) IDStr() string {
	m := NodeMetaByNodeType(nt)
	if m == nil {
		return ""
	}
	return fmt.Sprintf("%d", m.ID)
}

func IDStrToNodeType(s string) NodeType {
	id, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return ""
	}
	for _, m := range NodeTypeMetas {
		if m.ID == id {
			return m.Key
		}
	}
	return ""
}

type NodeTypeMeta struct {
	ID              int64
	Key             NodeType
	DisplayKey      string
	Name            string `json:"name"`
	Category        string `json:"category"`
	Color           string `json:"color"`
	Desc            string `json:"desc"`
	IconURL         string `json:"icon_url"`
	SupportBatch    bool   `json:"support_batch"`
	Disabled        bool   `json:"disabled,omitempty"`
	EnUSName        string `json:"en_us_name,omitempty"`
	EnUSDescription string `json:"en_us_description,omitempty"`

	ExecutableMeta
}

func (ntm *NodeTypeMeta) GetDisplayKey() string {
	if len(ntm.DisplayKey) > 0 {
		return ntm.DisplayKey
	}

	return string(ntm.Key)
}

type Category struct {
	Key      string `json:"key"`
	Name     string `json:"name"`
	EnUSName string `json:"en_us_name"`
}

type ExecutableMeta struct {
	IsComposite          bool  `json:"is_composite,omitempty"`
	DefaultTimeoutMS     int64 `json:"default_timeout_ms,omitempty"` // default timeout in milliseconds, 0 means no timeout
	PreFillZero          bool  `json:"pre_fill_zero,omitempty"`
	PostFillNil          bool  `json:"post_fill_nil,omitempty"`
	MayUseChatModel      bool  `json:"may_use_chat_model,omitempty"`
	InputSourceAware     bool  `json:"input_source_aware,omitempty"`      // whether this node needs to know the runtime status of its input sources
	StreamSourceEOFAware bool  `json:"needs_stream_source_eof,omitempty"` // whether this node needs to be aware stream sources' SourceEOF error

	// IncrementalOutput indicates that the node's output is intended for progressive, user-facing streaming.
	// This distinguishes nodes that actually stream text to the user (e.g., 'Exit', 'Output')
	//from those that are merely capable of streaming internally (defined by StreamingParadigms),
	// In essence, nodes with IncrementalOutput are a subset of those defined in StreamingParadigms.
	// When set to true, stream chunks from the node are persisted in real-time and can be fetched by get_process.
	IncrementalOutput bool `json:"incremental_output,omitempty"`

	// UseCtxCache indicates that the node would require a newly initialized ctx cache for each invocation.
	// example use cases:
	// - write warnings to the ctx cache during Invoke, and read from the ctx within Callback output converter
	UseCtxCache bool `json:"use_ctx_cache"`
}

type PluginNodeMeta struct {
	PluginID int64    `json:"plugin_id"`
	NodeType NodeType `json:"node_type"`
	Category string   `json:"category"`
	ApiID    int64    `json:"api_id"`
	ApiName  string   `json:"api_name"`
	Name     string   `json:"name"`
	Desc     string   `json:"desc"`
	IconURL  string   `json:"icon_url"`
}

type PluginCategoryMeta struct {
	PluginCategoryMeta int64    `json:"plugin_category_meta"`
	NodeType           NodeType `json:"node_type"`
	Category           string   `json:"category"`
	Name               string   `json:"name"`
	OnlyOfficial       bool     `json:"only_official"`
	IconURL            string   `json:"icon_url"`
}

const (
	NodeTypeVariableAggregator         NodeType = "VariableAggregator"
	NodeTypeIntentDetector             NodeType = "IntentDetector"
	NodeTypeTextProcessor              NodeType = "TextProcessor"
	NodeTypeHTTPRequester              NodeType = "HTTPRequester"
	NodeTypeLoop                       NodeType = "Loop"
	NodeTypeContinue                   NodeType = "Continue"
	NodeTypeBreak                      NodeType = "Break"
	NodeTypeVariableAssigner           NodeType = "VariableAssigner"
	NodeTypeVariableAssignerWithinLoop NodeType = "VariableAssignerWithinLoop"
	NodeTypeQuestionAnswer             NodeType = "QuestionAnswer"
	NodeTypeInputReceiver              NodeType = "InputReceiver"
	NodeTypeOutputEmitter              NodeType = "OutputEmitter"
	NodeTypeDatabaseCustomSQL          NodeType = "DatabaseCustomSQL"
	NodeTypeDatabaseQuery              NodeType = "DatabaseQuery"
	NodeTypeDatabaseInsert             NodeType = "DatabaseInsert"
	NodeTypeDatabaseDelete             NodeType = "DatabaseDelete"
	NodeTypeDatabaseUpdate             NodeType = "DatabaseUpdate"
	NodeTypeKnowledgeIndexer           NodeType = "KnowledgeIndexer"
	NodeTypeKnowledgeRetriever         NodeType = "KnowledgeRetriever"
	NodeTypeKnowledgeDeleter           NodeType = "KnowledgeDeleter"
	NodeTypeEntry                      NodeType = "Entry"
	NodeTypeExit                       NodeType = "Exit"
	NodeTypeCodeRunner                 NodeType = "CodeRunner"
	NodeTypePlugin                     NodeType = "Plugin"
	NodeTypeCreateConversation         NodeType = "CreateConversation"
	NodeTypeMessageList                NodeType = "MessageList"
	NodeTypeClearMessage               NodeType = "ClearMessage"
	NodeTypeLambda                     NodeType = "Lambda"
	NodeTypeLLM                        NodeType = "LLM"
	NodeTypeSelector                   NodeType = "Selector"
	NodeTypeBatch                      NodeType = "Batch"
	NodeTypeSubWorkflow                NodeType = "SubWorkflow"
	NodeTypeJsonSerialization          NodeType = "JsonSerialization"
	NodeTypeJsonDeserialization        NodeType = "JsonDeserialization"
	NodeTypeComment                    NodeType = "Comment"
)

const (
	EntryNodeKey = "100001"
	ExitNodeKey  = "900001"
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
// It is initialized with built-in node types and potentially extended by loading from external sources.
var NodeTypeMetas = map[NodeType]*NodeTypeMeta{
	NodeTypeEntry: {
		ID:           1,
		Key:          NodeTypeEntry,
		DisplayKey:   "Start",
		Name:         "开始",
		Category:     "input&output",
		Desc:         "工作流的起始节点，用于设定启动工作流需要的信息",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			PostFillNil: true,
		},
		EnUSName:        "Start",
		EnUSDescription: "The starting node of the workflow, used to set the information needed to initiate the workflow.",
	},
	NodeTypeExit: {
		ID:           2,
		Key:          NodeTypeExit,
		DisplayKey:   "End",
		Name:         "结束",
		Category:     "input&output",
		Desc:         "工作流的最终节点，用于返回工作流运行后的结果信息",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			PreFillZero:          true,
			InputSourceAware:     true,
			StreamSourceEOFAware: true,
			IncrementalOutput:    true,
		},
		EnUSName:        "End",
		EnUSDescription: "The final node of the workflow, used to return the result information after the workflow runs.",
	},
	NodeTypeLLM: {
		ID:           3,
		Key:          NodeTypeLLM,
		DisplayKey:   "LLM",
		Name:         "大模型",
		Category:     "",
		Desc:         "调用大语言模型,使用变量和提示词生成回复",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LLM-v2.jpg",
		SupportBatch: true,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 3 * 60 * 1000, // 3 minutes
			PreFillZero:      true,
			PostFillNil:      true,
			InputSourceAware: true,
			MayUseChatModel:  true,
		},
		EnUSName:        "LLM",
		EnUSDescription: "Invoke the large language model, generate responses using variables and prompt words.",
	},
	NodeTypePlugin: {
		ID:           4,
		Key:          NodeTypePlugin,
		DisplayKey:   "Api",
		Name:         "插件",
		Category:     "",
		Desc:         "通过添加工具访问实时数据和执行外部操作",
		Color:        "#CA61FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Plugin-v2.jpg",
		SupportBatch: true,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 3 * 60 * 1000, // 3 minutes
			PreFillZero:      true,
			PostFillNil:      true,
		},
		EnUSName:        "Plugin",
		EnUSDescription: "Used to access external real-time data and perform operations",
	},
	NodeTypeCodeRunner: {
		ID:           5,
		Key:          NodeTypeCodeRunner,
		DisplayKey:   "Code",
		Name:         "代码",
		Category:     "logic",
		Desc:         "编写代码，处理输入变量来生成返回值",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Code-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
			UseCtxCache:      true,
		},
		EnUSName:        "Code",
		EnUSDescription: "Write code to process input variables to generate return values.",
	},
	NodeTypeKnowledgeRetriever: {
		ID:           6,
		Key:          NodeTypeKnowledgeRetriever,
		DisplayKey:   "Dataset",
		Name:         "知识库检索",
		Category:     "data",
		Desc:         "在选定的知识中,根据输入变量召回最匹配的信息,并以列表形式返回",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-KnowledgeQuery-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
		},
		EnUSName:        "Knowledge retrieval",
		EnUSDescription: "In the selected knowledge, the best matching information is recalled based on the input variable and returned as an Array.",
	},
	NodeTypeSelector: {
		ID:              8,
		Key:             NodeTypeSelector,
		DisplayKey:      "If",
		Name:            "选择器",
		Category:        "logic",
		Desc:            "连接多个下游分支，若设定的条件成立则仅运行对应的分支，若均不成立则只运行“否则”分支",
		Color:           "#00B2B2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Condition-v2.jpg",
		SupportBatch:    false,
		ExecutableMeta:  ExecutableMeta{},
		EnUSName:        "Condition",
		EnUSDescription: "Connect multiple downstream branches. Only the corresponding branch will be executed if the set conditions are met. If none are met, only the 'else' branch will be executed.",
	},
	NodeTypeSubWorkflow: {
		ID:              9,
		Key:             NodeTypeSubWorkflow,
		DisplayKey:      "SubWorkflow",
		Name:            "工作流",
		Category:        "",
		Desc:            "集成已发布工作流，可以执行嵌套子任务",
		Color:           "#00B83E",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Workflow-v2.jpg",
		SupportBatch:    true,
		ExecutableMeta:  ExecutableMeta{},
		EnUSName:        "Workflow",
		EnUSDescription: "Add published workflows to execute subtasks",
	},
	NodeTypeDatabaseCustomSQL: {
		ID:           12,
		Key:          NodeTypeDatabaseCustomSQL,
		DisplayKey:   "End",
		Name:         "SQL自定义",
		Category:     "database",
		Desc:         "基于用户自定义的 SQL 完成对数据库的增删改查操作",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Database-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
		},
		EnUSName:        "SQL Customization",
		EnUSDescription: "Complete the operations of adding, deleting, modifying and querying the database based on user-defined SQL",
	},
	NodeTypeOutputEmitter: {
		ID:           13,
		Key:          NodeTypeOutputEmitter,
		DisplayKey:   "Message",
		Name:         "输出",
		Category:     "input&output",
		Desc:         "节点从“消息”更名为“输出”，支持中间过程的消息输出，支持流式和非流式两种方式",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Output-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			PreFillZero:          true,
			InputSourceAware:     true,
			StreamSourceEOFAware: true,
			IncrementalOutput:    true,
		},
		EnUSName:        "Output",
		EnUSDescription: "The node is renamed from \"message\" to \"output\", Supports message output in the intermediate process and streaming and non-streaming methods",
	},
	NodeTypeTextProcessor: {
		ID:           15,
		Key:          NodeTypeTextProcessor,
		DisplayKey:   "Text",
		Name:         "文本处理",
		Category:     "utilities",
		Desc:         "用于处理多个字符串类型变量的格式",
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-StrConcat-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			PreFillZero:      true,
			InputSourceAware: true,
		},
		EnUSName:        "Text Processing",
		EnUSDescription: "The format used for handling multiple string-type variables.",
	},
	NodeTypeQuestionAnswer: {
		ID:           18,
		Key:          NodeTypeQuestionAnswer,
		DisplayKey:   "Question",
		Name:         "问答",
		Category:     "utilities",
		Desc:         "支持中间向用户提问问题,支持预置选项提问和开放式问题提问两种方式",
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Direct-Question-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
			MayUseChatModel:  true,
		},
		EnUSName:        "Question",
		EnUSDescription: "Support asking questions to the user in the middle of the conversation, with both preset options and open-ended questions",
	},
	NodeTypeBreak: {
		ID:              19,
		Key:             NodeTypeBreak,
		DisplayKey:      "Break",
		Name:            "终止循环",
		Category:        "logic",
		Desc:            "用于立即终止当前所在的循环，跳出循环体",
		Color:           "#00B2B2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Break-v2.jpg",
		SupportBatch:    false,
		ExecutableMeta:  ExecutableMeta{},
		EnUSName:        "Break",
		EnUSDescription: "Used to immediately terminate the current loop and jump out of the loop",
	},
	NodeTypeVariableAssignerWithinLoop: {
		ID:              20,
		Key:             NodeTypeVariableAssignerWithinLoop,
		DisplayKey:      "LoopSetVariable",
		Name:            "设置变量",
		Category:        "logic",
		Desc:            "用于重置循环变量的值，使其下次循环使用重置后的值",
		Color:           "#00B2B2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LoopSetVariable-v2.jpg",
		SupportBatch:    false,
		ExecutableMeta:  ExecutableMeta{},
		EnUSName:        "Set Variable",
		EnUSDescription: "Used to reset the value of the loop variable so that it uses the reset value in the next iteration",
	},
	NodeTypeLoop: {
		ID:           21,
		Key:          NodeTypeLoop,
		DisplayKey:   "Loop",
		Name:         "循环",
		Category:     "logic",
		Desc:         "用于通过设定循环次数和逻辑，重复执行一系列任务",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Loop-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			IsComposite:      true,
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
		},
		EnUSName:        "Loop",
		EnUSDescription: "Used to repeatedly execute a series of tasks by setting the number of iterations and logic",
	},
	NodeTypeIntentDetector: {
		ID:           22,
		Key:          NodeTypeIntentDetector,
		DisplayKey:   "Intent",
		Name:         "意图识别",
		Category:     "logic",
		Desc:         "用于用户输入的意图识别，并将其与预设意图选项进行匹配。",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Intent-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
			MayUseChatModel:  true,
		},
		EnUSName:        "Intent recognition",
		EnUSDescription: "Used for recognizing the intent in user input and matching it with preset intent options.",
	},
	NodeTypeKnowledgeIndexer: {
		ID:           27,
		Key:          NodeTypeKnowledgeIndexer,
		DisplayKey:   "DatasetWrite",
		Name:         "知识库写入",
		Category:     "data",
		Desc:         "写入节点可以添加 文本类型 的知识库，仅可以添加一个知识库",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-KnowledgeWriting-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
		},
		EnUSName:        "Knowledge writing",
		EnUSDescription: "The write node can add a knowledge base of type text. Only one knowledge base can be added.",
	},
	NodeTypeBatch: {
		ID:           28,
		Key:          NodeTypeBatch,
		DisplayKey:   "Batch",
		Name:         "批处理",
		Category:     "logic",
		Desc:         "通过设定批量运行次数和逻辑，运行批处理体内的任务",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Batch-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			IsComposite:      true,
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
		},
		EnUSName:        "Batch",
		EnUSDescription: "By setting the number of batch runs and logic, run the tasks in the batch body.",
	},
	NodeTypeContinue: {
		ID:              29,
		Key:             NodeTypeContinue,
		DisplayKey:      "Continue",
		Name:            "继续循环",
		Category:        "logic",
		Desc:            "用于终止当前循环，执行下次循环",
		Color:           "#00B2B2",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Continue-v2.jpg",
		SupportBatch:    false,
		ExecutableMeta:  ExecutableMeta{},
		EnUSName:        "Continue",
		EnUSDescription: "Used to immediately terminate the current loop and execute next loop",
	},
	NodeTypeInputReceiver: {
		ID:           30,
		Key:          NodeTypeInputReceiver,
		DisplayKey:   "Input",
		Name:         "输入",
		Category:     "input&output",
		Desc:         "支持中间过程的信息输入",
		Color:        "#5C62FF",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Input-v2.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			PostFillNil: true,
		},
		EnUSName:        "Input",
		EnUSDescription: "Support intermediate information input",
	},
	NodeTypeComment: {
		ID:           31,
		Key:          "",
		Name:         "注释",
		Category:     "",             // Not found in cate_list
		Desc:         "comment_desc", // Placeholder from JSON
		Color:        "",
		IconURL:      "comment_icon", // Placeholder from JSON
		SupportBatch: false,          // supportBatch: 1
		EnUSName:     "Comment",
	},
	NodeTypeVariableAggregator: {
		ID:           32,
		Key:          NodeTypeVariableAggregator,
		Name:         "变量聚合",
		Category:     "logic",
		Desc:         "对多个分支的输出进行聚合处理",
		Color:        "#00B2B2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/VariableMerge-icon.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			PostFillNil:      true,
			InputSourceAware: true,
			UseCtxCache:      true,
		},
		EnUSName:        "Variable Merge",
		EnUSDescription: "Aggregate the outputs of multiple branches.",
	},
	NodeTypeMessageList: {
		ID:           37,
		Key:          NodeTypeMessageList,
		Name:         "查询消息列表",
		Category:     "message",
		Desc:         "用于查询消息列表",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-List.jpeg",
		SupportBatch: false,
		Disabled:     true,
		ExecutableMeta: ExecutableMeta{
			PreFillZero: true,
			PostFillNil: true,
		},
		EnUSName:        "Query message list",
		EnUSDescription: "Used to query the message list",
	},
	NodeTypeClearMessage: {
		ID:           38,
		Key:          NodeTypeClearMessage,
		Name:         "清除上下文",
		Category:     "conversation_history",
		Desc:         "用于清空会话历史，清空后LLM看到的会话历史为空",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-Delete.jpeg",
		SupportBatch: false,
		Disabled:     true,
		ExecutableMeta: ExecutableMeta{
			PreFillZero: true,
			PostFillNil: true,
		},
		EnUSName:        "Clear conversation history",
		EnUSDescription: "Used to clear conversation history. After clearing, the conversation history visible to the LLM node will be empty.",
	},
	NodeTypeCreateConversation: {
		ID:           39,
		Key:          NodeTypeCreateConversation,
		Name:         "创建会话",
		Category:     "conversation_management",
		Desc:         "用于创建会话",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Conversation-Create.jpeg",
		SupportBatch: false,
		Disabled:     true,
		ExecutableMeta: ExecutableMeta{
			PreFillZero: true,
			PostFillNil: true,
		},
		EnUSName:        "Create conversation",
		EnUSDescription: "This node is used to create a conversation.",
	},
	NodeTypeVariableAssigner: {
		ID:              40,
		Key:             NodeTypeVariableAssigner,
		DisplayKey:      "AssignVariable",
		Name:            "变量赋值",
		Category:        "data",
		Desc:            "用于给支持写入的变量赋值，包括应用变量、用户变量",
		Color:           "#FF811A",
		IconURL:         "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/Variable.jpg",
		SupportBatch:    false,
		ExecutableMeta:  ExecutableMeta{},
		EnUSName:        "Variable assign",
		EnUSDescription: "Assigns values to variables that support the write operation, including app and user variables.",
	},
	NodeTypeDatabaseUpdate: {
		ID:           42,
		Key:          NodeTypeDatabaseUpdate,
		DisplayKey:   "DatabaseUpdate",
		Name:         "更新数据",
		Category:     "database",
		Desc:         "修改表中已存在的数据记录，用户指定更新条件和内容来更新数据",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-update.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
		},
		EnUSName:        "Update Data",
		EnUSDescription: "Modify the existing data records in the table, and the user specifies the update conditions and contents to update the data",
	},
	NodeTypeDatabaseQuery: {
		ID:           43,
		Key:          NodeTypeDatabaseQuery,
		DisplayKey:   "DatabaseSelect",
		Name:         "查询数据",
		Category:     "database",
		Desc:         "从表获取数据，用户可定义查询条件、选择列等，输出符合条件的数据",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icaon-database-select.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
		},
		EnUSName:        "Query Data",
		EnUSDescription: "Query data from the table, and the user can define query conditions, select columns, etc., and output the data that meets the conditions",
	},
	NodeTypeDatabaseDelete: {
		ID:           44,
		Key:          NodeTypeDatabaseDelete,
		DisplayKey:   "DatabaseDelete",
		Name:         "删除数据",
		Category:     "database",
		Desc:         "从表中删除数据记录，用户指定删除条件来删除符合条件的记录",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-delete.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
		},
		EnUSName:        "Delete Data",
		EnUSDescription: "Delete data records from the table, and the user specifies the deletion conditions to delete the records that meet the conditions",
	},
	NodeTypeHTTPRequester: {
		ID:           45,
		Key:          NodeTypeHTTPRequester,
		DisplayKey:   "Http",
		Name:         "HTTP 请求",
		Category:     "utilities",
		Desc:         "用于发送API请求，从接口返回数据",
		Color:        "#3071F2",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-HTTP.png",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
		},
		EnUSName:        "HTTP request",
		EnUSDescription: "It is used to send API requests and return data from the interface.",
	},
	NodeTypeDatabaseInsert: {
		ID:           46,
		Key:          NodeTypeDatabaseInsert,
		DisplayKey:   "DatabaseInsert",
		Name:         "新增数据",
		Category:     "database",
		Desc:         "向表添加新数据记录，用户输入数据内容后插入数据库",
		Color:        "#F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-database-insert.jpg",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
		},
		EnUSName:        "Add Data",
		EnUSDescription: "Add new data records to the table, and insert them into the database after the user enters the data content",
	},
	NodeTypeJsonSerialization: {
		// ID is the unique identifier of this node type. Used in various front-end APIs.
		ID: 58,

		// Key is the unique NodeType of this node. Used in backend code as well as saved in DB.
		Key: NodeTypeJsonSerialization,

		// DisplayKey is the string used in frontend to identify this node.
		// Example use cases:
		// - used during querying test-run results for nodes
		// - used in returned messages from streaming openAPI Runs.
		// If empty, will use Key as DisplayKey.
		DisplayKey: "ToJSON",

		// Name is the node in ZH_CN, will be displayed on Canvas.
		Name: "JSON 序列化",

		// Category is the category of this node, determines which category this node will be displayed in.
		Category: "utilities",

		// Desc is the desc in ZH_CN, will be displayed as tooltip on Canvas.
		Desc: "用于把变量转化为JSON字符串",

		// Color is the color of the upper edge of the node displayed on Canvas.
		Color: "F2B600",

		// IconURL is the URL of the icon displayed on Canvas.
		IconURL: "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-to_json.png",

		// SupportBatch indicates whether this node can set batch mode.
		// NOTE: ultimately it's frontend that decides which node can enable batch mode.
		SupportBatch: false,

		// ExecutableMeta configures certain common aspects of request-time behaviors for this node.
		ExecutableMeta: ExecutableMeta{
			// DefaultTimeoutMS configures the default timeout for this node, in milliseconds. 0 means no timeout.
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			// PreFillZero decides whether to pre-fill zero value for any missing fields in input.
			PreFillZero: true,
			// PostFillNil decides whether to post-fill nil value for any missing fields in output.
			PostFillNil: true,
		},
		// EnUSName is the name in EN_US, will be displayed on Canvas if language of Coze-Studio is set to EnUS.
		EnUSName: "JSON serialization",
		// EnUSDescription is the description in EN_US, will be displayed on Canvas if language of Coze-Studio is set to EnUS.
		EnUSDescription: "Convert variable to JSON string",
	},
	NodeTypeJsonDeserialization: {
		ID:           59,
		Key:          NodeTypeJsonDeserialization,
		DisplayKey:   "FromJSON",
		Name:         "JSON 反序列化",
		Category:     "utilities",
		Desc:         "用于将JSON字符串解析为变量",
		Color:        "F2B600",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-from_json.png",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
			UseCtxCache:      true,
		},
		EnUSName:        "JSON deserialization",
		EnUSDescription: "Parse JSON string to variable",
	},
	NodeTypeKnowledgeDeleter: {
		ID:           60,
		Key:          NodeTypeKnowledgeDeleter,
		DisplayKey:   "KnowledgeDelete",
		Name:         "知识库删除",
		Category:     "data",
		Desc:         "用于删除知识库中的文档",
		Color:        "#FF811A",
		IconURL:      "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icons-dataset-delete.png",
		SupportBatch: false,
		ExecutableMeta: ExecutableMeta{
			DefaultTimeoutMS: 60 * 1000, // 1 minute
			PreFillZero:      true,
			PostFillNil:      true,
		},
		EnUSName:        "Knowledge delete",
		EnUSDescription: "The delete node can delete a document in knowledge base.",
	},
	NodeTypeLambda: {
		ID:       1000,
		Key:      NodeTypeLambda,
		Name:     "Lambda",
		EnUSName: "Comment",
	},
}

// PluginNodeMetas holds metadata for specific plugin API entity.
var PluginNodeMetas []*PluginNodeMeta

// PluginCategoryMetas holds metadata for plugin category entity.
var PluginCategoryMetas []*PluginCategoryMeta

func NodeMetaByNodeType(t NodeType) *NodeTypeMeta {
	if m, ok := NodeTypeMetas[t]; ok {
		return m
	}

	return nil
}
