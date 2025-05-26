package nodes

import (
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity"
	"code.byted.org/flow/opencoze/backend/domain/workflow/entity/vo"
)

type InterruptEventStore interface {
	GetInterruptEvent(nodeKey vo.NodeKey) (*entity.InterruptEvent, bool, error)
	SetInterruptEvent(nodeKey vo.NodeKey, value *entity.InterruptEvent) error
	DeleteInterruptEvent(nodeKey vo.NodeKey) error
}
