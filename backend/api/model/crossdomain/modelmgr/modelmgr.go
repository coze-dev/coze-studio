package model

type LLMParams struct {
	ModelName         string         `json:"modelName"`
	ModelType         int64          `json:"modelType"`
	Prompt            string         `json:"prompt"` // user prompt
	Temperature       *float64       `json:"temperature"`
	FrequencyPenalty  float64        `json:"frequencyPenalty"`
	PresencePenalty   float64        `json:"presencePenalty"`
	MaxTokens         int            `json:"maxTokens"`
	TopP              *float64       `json:"topP"`
	TopK              *int           `json:"topK"`
	EnableChatHistory bool           `json:"enableChatHistory"`
	SystemPrompt      string         `json:"systemPrompt"`
	ResponseFormat    ResponseFormat `json:"responseFormat"`
	ChatHistoryRound  int64          `json:"chatHistoryRound"`
}

type ResponseFormat int64

const (
	ResponseFormatText     ResponseFormat = 0
	ResponseFormatMarkdown ResponseFormat = 1
	ResponseFormatJSON     ResponseFormat = 2
)
