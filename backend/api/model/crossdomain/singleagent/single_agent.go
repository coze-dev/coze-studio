package singleagent

import (
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/agentrun"
	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
	"github.com/cloudwego/eino/schema"
	"gorm.io/gorm"
)

type AgentRuntime struct {
	AgentVersion     string
	IsDraft          bool
	SpaceID          int64
	ConnectorID      int64
	PreRetrieveTools []*agentrun.Tool
}

type EventType string

const (
	EventTypeOfFinalAnswer  EventType = "final_answer"
	EventTypeOfToolsMessage EventType = "tools_message"
	EventTypeOfFuncCall     EventType = "func_call"
	EventTypeOfSuggest      EventType = "suggest"
	EventTypeOfKnowledge    EventType = "knowledge"
)

type AgentEvent struct {
	EventType EventType

	FinalAnswer  *schema.StreamReader[*schema.Message]
	ToolsMessage []*schema.Message
	FuncCall     *schema.Message
	Suggest      *schema.Message
	Knowledge    []*schema.Document
}

type SingleAgent struct {
	AgentID   int64
	CreatorID int64
	SpaceID   int64
	Name      string
	Desc      string
	IconURI   string
	CreatedAt int64
	UpdatedAt int64
	DeletedAt gorm.DeletedAt

	VariablesMetaID         *int64
	OnboardingInfo          *bot_common.OnboardingInfo
	ModelInfo               *bot_common.ModelInfo
	Prompt                  *bot_common.PromptInfo
	Plugin                  []*bot_common.PluginInfo
	Knowledge               *bot_common.Knowledge
	Workflow                []*bot_common.WorkflowInfo
	SuggestReply            *bot_common.SuggestReplyInfo
	JumpConfig              *bot_common.JumpConfig
	BackgroundImageInfoList []*bot_common.BackgroundImageInfo
	Database                []*bot_common.Database
	ShortcutCommand         []string
}

type ExecuteRequest struct {
	Identity *AgentIdentity
	UserID   int64
	SpaceID  int64

	Input        *schema.Message
	History      []*schema.Message
	PreCallTools []*agentrun.ToolsRetriever
}

type AgentIdentity struct {
	AgentID int64
	// State   AgentState
	Version     string
	IsDraft     bool
	ConnectorID int64
}
