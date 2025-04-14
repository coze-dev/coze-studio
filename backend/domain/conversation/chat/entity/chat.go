package entity

type ChatItem struct {
	ID             int64      `json:"id"`
	ConversationID int64      `json:"conversation_id"`
	SectionID      int64      `json:"section_id"`
	AgentID        int64      `json:"agent_id"`
	Status         ChatStatus `json:"status"`
	Error          *ChatError `json:"last_error"`
	Usage          *Usage     `json:"usage"`
	Ext            string     `json:"ext"`
	CreatedAt      int64      `json:"created_at"`
	CompletedAt    int64      `json:"completed_at"`
	FailedAt       int64      `json:"failed_at"`
}

type MessageItem struct {
	ID               int64       `json:"id"`
	ConversationID   int64       `json:"conversation_id"`
	SectionID        int64       `json:"section_id"`
	ChatID           int64       `json:"chat_id"`
	AgentID          int64       `json:"agent_id"`
	Role             RoleType    `json:"role"`
	Type             MessageType `json:"type"`
	Content          string      `json:"content"`
	ContentType      ContentType `json:"content_type"`
	ReasoningContent *string     `json:"reasoning_content"`
	CreatedAt        int64       `json:"created_at"`
	UpdatedAt        int64       `json:"updated_at"`
}

type ChatError struct {
	Code int32  `json:"code"`
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
	PluginId   int64  `json:"plugin_id"`  //plugin id
	Parameters string `json:"parameters"` // parameters
	ApiName    string `json:"api_name"`   //api name
}

type InputMetaData struct {
	Type     InputType `json:"type"`
	Text     string    `json:"text"`
	FileData FileData  `json:"file_data"`
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

type ChatMessage struct {
	ConversationID  int64             `json:"conversation_id"`
	SectionID       int64             `json:"section_id"`
	UserID          int64             `json:"user_id"`
	AgentID         int64             `json:"agent_id"`
	Content         InputMetaData     `json:"content"`
	Tools           []*Tool           `json:"tools"`
	CustomerConfig  *CustomerConfig   `json:"customer_config"`
	CustomVariables map[string]string `json:"custom_variables"`
	Ext             string            `json:"ext"`
}

type AgentChatRequest struct {
	ChatMessage *ChatMessage `json:"chat_message"`
}

type AgentChatResponse struct {
	Event       ChatEvent    `json:"event"`
	ChatItem    *ChatItem    `json:"chat_item"`
	MessageItem *MessageItem `json:"message_item"`
	Error       *ChatError   `json:"error_data"`
}

type ChatCreateMessage struct {
	ConversationID int64         `json:"conversation_id"`
	SectionID      int64         `json:"section_id"`
	AgentID        int64         `json:"agent_id"`
	UserID         int64         `json:"user_id"`
	ContentType    ContentType   `json:"content_type"`
	Content        InputMetaData `json:"content"`
	RoleType       RoleType      `json:"role_type"`
	MessageType    MessageType   `json:"message_type"`
	Ext            string        `json:"ext"`
}
