package model

type ModelInfo struct {
	ModelName   string  `json:"model_name" yaml:"model_name"`
	Temperature float64 `json:"temperature,omitempty" yaml:"temperature,omitempty"`
	MaxTokens   int     `json:"max_tokens,omitempty" yaml:"max_tokens,omitempty"`
}

type Prompt struct {
	SP string `json:"sp" yaml:"sp"`
}

type Plugins struct {
	ApiIDs []int64 `json:"api_ids,omitempty" yaml:"api_ids,omitempty"`
}

type Tool struct {
	Name        string                 `json:"name" yaml:"name"`
	Description string                 `json:"description" yaml:"description"`
	Parameters  map[string]interface{} `json:"parameters" yaml:"parameters"`
	Required    []string               `json:"required" yaml:"required"`
}

type Knowledge struct {
	IDs []int64 `json:"ids,omitempty" yaml:"ids,omitempty"`
}

type Workflow struct {
	IDs []int64 `json:"ids,omitempty" yaml:"ids,omitempty"`
}

type SuggestReply struct{}

type JumpConfig struct{}
