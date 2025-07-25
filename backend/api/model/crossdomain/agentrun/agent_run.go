package agentrun

type Tool struct {
	PluginID  int64    `json:"plugin_id"`
	ToolID    int64    `json:"tool_id"`
	Arguments string   `json:"arguments"`
	ToolName  string   `json:"tool_name"`
	Type      ToolType `json:"type"`
}

type ToolType int32

const (
	ToolTypePlugin   ToolType = 2
	ToolTypeWorkflow ToolType = 1
)

type ToolsRetriever struct {
	PluginID  int64
	ToolName  string
	ToolID    int64
	Arguments string
	Type      ToolType
}

type Usage struct {
	LlmPromptTokens     int64  `json:"llm_prompt_tokens"`
	LlmCompletionTokens int64  `json:"llm_completion_tokens"`
	LlmTotalTokens      int64  `json:"llm_total_tokens"`
	WorkflowTokens      *int64 `json:"workflow_tokens,omitempty"`
	WorkflowCost        *int64 `json:"workflow_cost,omitempty"`
}
