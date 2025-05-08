package entity

import "github.com/cloudwego/eino/schema"

type ChunkRunItem struct {
	ID             int64     `json:"id"`
	ConversationID int64     `json:"conversation_id"`
	SectionID      int64     `json:"section_id"`
	AgentID        int64     `json:"agent_id"`
	Status         RunStatus `json:"status"`
	Error          *RunError `json:"error"`
	Usage          *Usage    `json:"usage"`
	Ext            string    `json:"ext"`
	CreatedAt      int64     `json:"created_at"`
	UpdatedAt      int64     `json:"updated_at"`
	ChatRequest    *string   `json:"chat_message"`
	CompletedAt    int64     `json:"completed_at"`
	FailedAt       int64     `json:"failed_at"`
}

type ChunkMessageItem struct {
	ID               int64       `json:"id"`
	ConversationID   int64       `json:"conversation_id"`
	SectionID        int64       `json:"section_id"`
	RunID            int64       `json:"run_id"`
	AgentID          int64       `json:"agent_id"`
	Role             RoleType    `json:"role"`
	Type             MessageType `json:"type"`
	Content          string      `json:"content"`
	ContentType      ContentType `json:"content_type"`
	Ext              string      `json:"ext"`
	ReasoningContent *string     `json:"reasoning_content"`
	Index            int64       `json:"index"`
	SeqID            int64       `json:"seq_id"`
	CreatedAt        int64       `json:"created_at"`
	UpdatedAt        int64       `json:"updated_at"`
}

type RunError struct {
	Code int64  `json:"code"`
	Msg  string `json:"msg"`
}

type CustomerConfig struct {
	ModelConfig *ModelConfig `json:"model_config"`
	AgentConfig *AgentConfig `json:"agent_config"`
}

type ModelConfig struct {
	ModelId *int64 `json:"model_id,omitempty"`
}

type AgentConfig struct {
	Prompt *string `json:"prompt"`
}

type Tool struct {
	PluginId   int64  `json:"plugin_id"`
	Parameters string `json:"parameters"`
	ApiName    string `json:"api_name"`
}

type InputMetaData struct {
	Type     InputType   `json:"type"`
	Text     string      `json:"text"`
	FileData []*FileData `json:"file_data"`
}

type FileData struct {
	Url  string `json:"url"`
	Name string `json:"name"`
}

type MetaInfo struct {
	Type MetaType `json:"type"`
	Info string   `json:"info"`
}

type Usage struct {
	LlmPromptTokens     int64  `json:"llm_prompt_tokens"`
	LlmCompletionTokens int64  `json:"llm_completion_tokens"`
	LlmTotalTokens      int64  `json:"llm_total_tokens"`
	WorkflowTokens      *int64 `json:"workflow_tokens"`
	WorkflowCost        *int64 `json:"workflow_cost"`
}

type AgentRunRequest struct {
	ConversationID  int64             `json:"conversation_id"`
	SpaceID         int64             `json:"space_id"`
	SectionID       int64             `json:"section_id"`
	Name            string            `json:"name"`
	UserID          int64             `json:"user_id"`
	AgentID         int64             `json:"agent_id"`
	ContentType     ContentType       `json:"content_type"`
	Content         []*InputMetaData  `json:"content"`
	Tools           []*Tool           `json:"tools"`
	CustomerConfig  *CustomerConfig   `json:"customer_config"`
	DisplayContent  string            `json:"display_content"`
	CustomVariables map[string]string `json:"custom_variables"`
	Version         string            `json:"version"`
	Ext             map[string]string `json:"ext"`
}

type AgentRunResponse struct {
	Event            RunEvent          `json:"event"`
	ChunkRunItem     *ChunkRunItem     `json:"run_record_item"`
	ChunkMessageItem *ChunkMessageItem `json:"message_item"`
	Error            *RunError         `json:"error"`
}

type Suggestion struct{}

type AgentRespEvent struct {
	EventType MessageType

	FinalAnswer  *schema.StreamReader[*schema.Message]
	ToolsMessage []*schema.Message
	FuncCall     *schema.Message
	Suggest      *Suggestion
	Knowledge    []*schema.Document
}
