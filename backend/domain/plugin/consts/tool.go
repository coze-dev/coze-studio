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

type InvalidResponseProcessStrategy int8

const (
	InvalidResponseProcessStrategyOfReturnRaw     InvalidResponseProcessStrategy = 0 // If the value of a field is invalid, the raw response value of the field is returned.
	InvalidResponseProcessStrategyOfReturnDefault InvalidResponseProcessStrategy = 1 // If the value of a field is invalid, the default value of the field is returned.
)

type PluginType string

const (
	PluginTypeOfLocal PluginType = "localplugin"
	PluginTypeOfCloud PluginType = "openapi"
)
