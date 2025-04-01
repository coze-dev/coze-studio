package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/entity/common"
)

type Model struct {
	common.Info
	Meta     ModelMeta
	Scenario Scenario
}
