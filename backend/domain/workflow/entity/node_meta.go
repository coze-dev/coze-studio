package entity

type NodeType string

type NodeTypeMeta struct {
	ID               int64    `json:"id"`
	Name             string   `json:"name"`
	Type             NodeType `json:"type"`
	Category         string   `json:"category"`
	Color            string   `json:"color"`
	Desc             string   `json:"desc"`
	IconURL          string   `json:"icon_url"`
	IsComposite      bool     `json:"is_composite"`
	SupportBatch     bool     `json:"support_batch"`
	DefaultTimeoutMS int64    `json:"default_timeout_ms,omitempty"` // default timeout in milliseconds, 0 means no timeout
	PreFillZero      bool     `json:"pre_fill_zero,omitempty"`
	PostFillNil      bool     `json:"post_fill_nil,omitempty"`
	CallbackEnabled  bool     `json:"callback_enabled,omitempty"` // is false, Eino framework will inject callbacks for this node
	Disabled         bool     `json:"disabled,omitempty"`
	MayUseChatModel  bool     `json:"may_use_chat_model,omitempty"`
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
)
