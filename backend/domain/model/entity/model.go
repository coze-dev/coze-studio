package entity

import (
	"github.com/getkin/kin-openapi/openapi3"
)

type Model struct {
	ID         int64
	Protocol   string
	Name       string // like: gpt-4o
	Capability *Capability
	Schema     *openapi3.Schema
}

type Capability struct {
	FunctionCall  bool     // 是否支持 fc
	JSONMode      bool     // 是否支持 json mode
	Reasoning     bool     // 是否支持 reasoning_content
	PrefixCaching bool     // 是否支持 prefix caching
	InputModal    []string // 输入模态
	OutputModal   []string // 输出模态
	InputTokens   int64
	OutputTokens  int64
	MaxTokens     int64
}
