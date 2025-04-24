package consts

type ExecuteScene string

const (
	ExecSceneOfAgentOnline ExecuteScene = "agent_online"
	ExecSceneOfAgentDraft  ExecuteScene = "agent_draft"
	ExecSceneOfWorkflow    ExecuteScene = "workflow"
	ExecSceneOfToolDebug   ExecuteScene = "tool_debug"
)

type ActivatedStatus int32

const (
	ActivateTool   ActivatedStatus = 0
	DeactivateTool ActivatedStatus = 1
)
