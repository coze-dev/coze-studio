package entity

import "code.byted.org/flow/opencoze/backend/domain/workflow/internal/nodes"

type NodeType = nodes.NodeType

type NodeTypeMeta struct {
	ID           int64    `json:"id"`
	Name         string   `json:"name"`
	Type         NodeType `json:"type"`
	Category     string   `json:"category"`
	Color        string   `json:"color"`
	Desc         string   `json:"desc"`
	IconURL      string   `json:"icon_url"`
	IsComposite  bool     `json:"is_composite"`
	SupportBatch bool     `json:"support_batch"`
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
	NodeTypeVariableAggregator         = nodes.NodeTypeVariableAggregator
	NodeTypeIntentDetector             = nodes.NodeTypeIntentDetector
	NodeTypeTextProcessor              = nodes.NodeTypeTextProcessor
	NodeTypeHTTPRequester              = nodes.NodeTypeHTTPRequester
	NodeTypeLoop                       = nodes.NodeTypeLoop
	NodeTypeContinue                   = nodes.NodeTypeContinue
	NodeTypeBreak                      = nodes.NodeTypeBreak
	NodeTypeVariableAssigner           = nodes.NodeTypeVariableAssigner
	NodeTypeVariableAssignerWithinLoop = nodes.NodeTypeVariableAssignerWithinLoop
	NodeTypeQuestionAnswer             = nodes.NodeTypeQuestionAnswer
	NodeTypeInputReceiver              = nodes.NodeTypeInputReceiver
	NodeTypeOutputEmitter              = nodes.NodeTypeOutputEmitter
	NodeTypeDatabaseCustomSQL          = nodes.NodeTypeDatabaseCustomSQL
	NodeTypeDatabaseQuery              = nodes.NodeTypeDatabaseQuery
	NodeTypeDatabaseInsert             = nodes.NodeTypeDatabaseInsert
	NodeTypeDatabaseDelete             = nodes.NodeTypeDatabaseDelete
	NodeTypeDatabaseUpdate             = nodes.NodeTypeDatabaseUpdate
	NodeTypeKnowledgeIndexer           = nodes.NodeTypeKnowledgeIndexer
	NodeTypeKnowledgeRetriever         = nodes.NodeTypeKnowledgeRetriever
	NodeTypeEntry                      = nodes.NodeTypeEntry
	NodeTypeExit                       = nodes.NodeTypeExit
	NodeTypeCodeRunner                 = nodes.NodeTypeCodeRunner
	NodeTypePlugin                     = nodes.NodeTypePlugin
	NodeTypeCreateConversation         = nodes.NodeTypeCreateConversation
	NodeTypeMessageList                = nodes.NodeTypeMessageList
	NodeTypeClearMessage               = nodes.NodeTypeClearMessage
	NodeTypeLambda                     = nodes.NodeTypeLambda
	NodeTypeLLM                        = nodes.NodeTypeLLM
	NodeTypeSelector                   = nodes.NodeTypeSelector
	NodeTypeBatch                      = nodes.NodeTypeBatch
	NodeTypeSubWorkflow                = nodes.NodeTypeSubWorkflow
)
