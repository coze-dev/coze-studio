package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Agent struct {
	common.Info
	AgentType

	ReactAgent *ReactAgent
	MultiAgent *MultiAgent

	Hook *Hook
}
