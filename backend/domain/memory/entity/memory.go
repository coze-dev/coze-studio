package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/common"
)

type Memory struct {
	common.Info

	Variables      []*Variable
	Databases      []*Database
	LongTermMemory *LongTermMemory
}

type Variable struct {
	Key          string
	Description  string
	DefaultValue *string

	EnablePromptRender bool // prompt 渲染是否使用
	Disabled           bool // 全场景禁用
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
