package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Model struct {
	common.Info
	Temperature      *float64
	MaxTokens        *int64
	TopP             *float64
	TopK             *int64
	FrequencyPenalty *float64
	PresencePenalty  *float64
	ResponseFormat   *int64
	Extra            map[string]any
}
