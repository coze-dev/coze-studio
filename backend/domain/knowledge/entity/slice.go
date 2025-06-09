package entity

import (
	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"
)

type Slice = knowledge.Slice

type WhereSliceOpt struct {
	KnowledgeID int64
	DocumentID  int64
	DocumentIDs []int64
	Keyword     *string
	Sequence    int64
	PageSize    int64
	Offset      int64
	NotEmpty    *bool
}
