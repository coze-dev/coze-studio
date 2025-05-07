package model

import (
	"context"

	"github.com/cloudwego/eino/components/model"
)

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
}

type ResponseFormat int64

const (
	ResponseFormatText     ResponseFormat = 0
	ResponseFormatMarkdown ResponseFormat = 1
	ResponseFormatJSON     ResponseFormat = 2
)

var ManagerImpl Manager

func GetManager() Manager {
	return ManagerImpl
}

func SetManager(m Manager) {
	ManagerImpl = m
}

//go:generate  mockgen -destination modelmock/model_mock.go --package mockmodel -source model.go
type Manager interface {
	GetModel(ctx context.Context, params *LLMParams) (model.BaseChatModel, error)
}
