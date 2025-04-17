package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
)

type Memory struct {
	common.Info

	Variables      []*entity.Variable
	Databases      []*Database
	LongTermMemory *LongTermMemory
}

type Database struct {
	common.Info

	Fields             []*DatabaseField
	EnablePromptRender bool // prompt 渲染是否使用
	RWMode             *TableRWMode
}

type DatabaseField struct {
	common.Info

	Type     DatabaseFieldType
	Required bool

	Extra map[string]any
}

type LongTermMemory struct {
	Enable             bool
	EnablePromptRender bool // prompt 渲染是否使用
}
