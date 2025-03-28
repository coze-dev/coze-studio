package entity

import (
	"github.com/getkin/kin-openapi/openapi3"

	"code.byted.org/flow/opencoze/backend/domain/common"
	"code.byted.org/flow/opencoze/backend/domain/model/entity/protocol"
)

type ModelMeta struct {
	common.Info

	Protocol    protocol.Protocol
	DisplayName string // like: GPT-4o
	Capability  *Capability
	ConnConfig  *ConnConfig // 这个字段目前应该仅可写，接口中不能返回出来。运行内部可以取值
	Schema      *openapi3.Schema
	Status      Status
}

type Capability struct {
	FunctionCall  bool    // 是否支持 fc
	JSONMode      bool    // 是否支持 json mode
	Reasoning     bool    // 是否支持 reasoning_content
	PrefixCaching bool    // 是否支持 prefix caching
	InputModal    []Modal // 输入模态
	OutputModal   []Modal // 输出模态
	InputTokens   int64
	OutputTokens  int64
	MaxTokens     int64
}

type ConnConfig struct {
	OpenAI   *protocol.OpenAI
	Claude   *protocol.Claude
	Deepseek *protocol.Deepseek

	Custom any // custom connection protocol
}
