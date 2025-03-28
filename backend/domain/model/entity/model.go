package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Model struct {
	common.Info

	Meta     ModelMeta
	Scenario Scenario
}
