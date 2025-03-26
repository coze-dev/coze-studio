package model

type Config struct {
	ModelName        *string  `json:"modelName"`
	Temperature      *float64 `json:"temperature"`
	FrequencyPenalty *float64 `json:"frequencyPenalty"`
	PresencePenalty  *float64 `json:"presencePenalty"`
	MaxTokens        *int     `json:"maxTokens"`
	TopP             *float64 `json:"topP"`
	TopK             *int     `json:"topK"`
}
