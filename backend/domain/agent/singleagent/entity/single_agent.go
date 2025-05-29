package entity

import (
	"gorm.io/gorm"

	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/api/model/ocean/cloud/bot_common"
)

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

type AgentIdentity struct {
	AgentID int64
	// State   AgentState
	Version     string
	IsDraft     bool
	ConnectorID int64
}

type DuplicateAgentRequest struct {
	UserID  int64
	SpaceID int64

	AgentID int64
}

type ToolType int32

const (
	ToolTypeOfWorkflow ToolType = 1
	ToolTypeOfPlugin   ToolType = 2
)

type ToolsRetriever struct {
	PluginID  int64
	ToolName  string
	ToolID    int64
	Arguments string
	Type      ToolType
}

type ExecuteRequest struct {
	Identity *AgentIdentity
	UserID   int64
	SpaceID  int64

	Input        *schema.Message
	History      []*schema.Message
	PreCallTools []*ToolsRetriever
}
