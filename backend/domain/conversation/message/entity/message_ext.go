package entity

type MessageExtKey string

const (
	MessageExtKeyInputTokens         MessageExtKey = "input_tokens"
	MessageExtKeyOutputTokens        MessageExtKey = "output_tokens"
	MessageExtKeyToken               MessageExtKey = "token"
	MessageExtKeyPluginStatus        MessageExtKey = "plugin_status"
	MessageExtKeyTimeCost            MessageExtKey = "time_cost"
	MessageExtKeyWorkflowTokens      MessageExtKey = "workflow_tokens"
	MessageExtKeyBotState            MessageExtKey = "bot_state"
	MessageExtKeyPluginRequest       MessageExtKey = "plugin_request"
	MessageExtKeyToolName            MessageExtKey = "tool_name"
	MessageExtKeyPlugin              MessageExtKey = "plugin"
	MessageExtKeyMockHitInfo         MessageExtKey = "mock_hit_info"
	MessageExtKeyMessageTitle        MessageExtKey = "message_title"
	MessageExtKeyStreamPluginRunning MessageExtKey = "stream_plugin_running"
	MessageExtKeyExecuteDisplayName  MessageExtKey = "execute_display_name"
	MessageExtKeyTaskType            MessageExtKey = "task_type"
)

type BotStateExt struct {
	BotID     string `json:"bot_id"`
	AgentName string `json:"agent_name"`
	AgentID   string `json:"agent_id"`
	Awaiting  string `json:"awaiting"`
}

type UsageExt struct {
	TotalCount   int64 `json:"total_count"`
	InputTokens  int64 `json:"input_tokens"`
	OutputTokens int64 `json:"output_tokens"`
}
