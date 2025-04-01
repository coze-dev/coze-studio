package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/chatmodel/internal/dal/model"
)

type Scenario int64 // 模型实体使用场景

const (
	ScenarioSingleReactAgent Scenario = 1
	ScenarioWorkflow         Scenario = 2
)

type Status int64 // 模型实体状态

const (
	StatusInUse   Status = 1  // 应用中，可使用可新建
	StatusPending Status = 5  // 待下线，可使用不可新建
	StatusDeleted Status = 10 // 已下线，不可使用不可新建
)

const (
	ModalText  model.Modal = "text"
	ModalImage model.Modal = "image"
	ModalAudio model.Modal = "audio"
	ModalVideo model.Modal = "video"
)
