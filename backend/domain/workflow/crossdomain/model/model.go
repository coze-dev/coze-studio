package model

import (
	"context"

	"github.com/cloudwego/eino/components/model"
)

type LLMParams struct {
	ModelName         string         `json:"modelName"`
	ModelType         int            `json:"modelType"`
	Prompt            string         `json:"prompt"` // user prompt
	Temperature       float64        `json:"temperature"`
	FrequencyPenalty  float64        `json:"frequencyPenalty"`
	PresencePenalty   float64        `json:"presencePenalty"`
	MaxTokens         int            `json:"maxTokens"`
	TopP              float64        `json:"topP"`
	TopK              int            `json:"topK"`
	EnableChatHistory bool           `json:"enableChatHistory"`
	SystemPrompt      string         `json:"systemPrompt"`
	ResponseFormat    ResponseFormat `json:"responseFormat"`
}

type ResponseFormat int64

const (
	ResponseFormat_Text     ResponseFormat = 0
	ResponseFormat_Markdown ResponseFormat = 1
	ResponseFormat_JSON     ResponseFormat = 2
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
	GetModel(ctx context.Context, params *LLMParams) (model.ChatModel, error)
}
