package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Knowledge struct {
	common.Info

	KnowledgeInfo  []*common.Info
	TopK           *int64
	MinScore       *float64
	SearchStrategy *SearchStrategy

	Extra map[string]any
}
