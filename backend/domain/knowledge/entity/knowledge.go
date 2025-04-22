package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/knowledge/entity/common"
)

type Knowledge struct {
	common.Info

	Type   DocumentType
	Status KnowledgeStatus
}
