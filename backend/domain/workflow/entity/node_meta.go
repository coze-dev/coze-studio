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

type NodeType string

type NodeTypeMeta struct {
	ID              int64    `json:"id"`
	Name            string   `json:"name"`
	Type            NodeType `json:"type"`
	Category        string   `json:"category"`
	Color           string   `json:"color"`
	Desc            string   `json:"desc"`
	IconURL         string   `json:"icon_url"`
	SupportBatch    bool     `json:"support_batch"`
	Disabled        bool     `json:"disabled,omitempty"`
	EnUSName        string   `json:"en_us_name,omitempty"`
	EnUSDescription string   `json:"en_us_description,omitempty"`

	ExecutableMeta
}

type Category struct {
	Key      string `json:"key"`
	Name     string `json:"name"`
	EnUSName string `json:"en_us_name"`
}

type StreamingParadigm string

const (
	Invoke    StreamingParadigm = "invoke"
	Stream    StreamingParadigm = "stream"
	Collect   StreamingParadigm = "collect"
	Transform StreamingParadigm = "transform"
)

type ExecutableMeta struct {
	IsComposite          bool                       `json:"is_composite,omitempty"`
	DefaultTimeoutMS     int64                      `json:"default_timeout_ms,omitempty"` // default timeout in milliseconds, 0 means no timeout
	PreFillZero          bool                       `json:"pre_fill_zero,omitempty"`
	PostFillNil          bool                       `json:"post_fill_nil,omitempty"`
	CallbackEnabled      bool                       `json:"callback_enabled,omitempty"` // is false, Eino framework will inject callbacks for this node
	MayUseChatModel      bool                       `json:"may_use_chat_model,omitempty"`
	InputSourceAware     bool                       `json:"input_source_aware,omitempty"` // whether this node needs to know the runtime status of its input sources
	StreamingParadigms   map[StreamingParadigm]bool `json:"streaming_paradigms,omitempty"`
	StreamSourceEOFAware bool                       `json:"needs_stream_source_eof,omitempty"` // whether this node needs to be aware stream sources' SourceEOF error
	/*
	 IncrementalOutput indicates that the node's output is intended for progressive, user-facing streaming.
	 This distinguishes nodes that actually stream text to the user (e.g., 'Exit', 'Output')
	 from those that are merely capable of streaming internally (defined by StreamingParadigms),
	 whose output is consumed by other nodes.
	 In essence, nodes with IncrementalOutput are a subset of those defined in StreamingParadigms.
	 When set to true, stream chunks from the node are persisted in real-time and can be fetched by get_process.
	*/
	IncrementalOutput bool `json:"incremental_output,omitempty"`
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
)

const (
	EntryNodeKey = "100001"
	ExitNodeKey  = "900001"
)
