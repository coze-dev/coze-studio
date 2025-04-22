package entity

import (
	"code.byted.org/flow/opencoze/backend/domain/memory/variables/entity"
)

type Memory struct {
	ID          int64
	Name        string
	Description string
	IconURI     string

	CreatorID int64
	SpaceID   int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	Variables      []*entity.Variable
	Databases      []*Database
	LongTermMemory *LongTermMemory
}

type Database struct {
	ID          int64
	Name        string
	Description string
	IconURI     string

	CreatorID int64
	SpaceID   int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	Fields             []*DatabaseField
	EnablePromptRender bool // prompt 渲染是否使用
	RWMode             *TableRWMode
}

type DatabaseField struct {
	ID          int64
	Name        string
	Description string
	IconURI     string

	CreatorID int64
	SpaceID   int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

	Type     DatabaseFieldType
	Required bool

	Extra map[string]any
}

type LongTermMemory struct {
	Enable             bool
	EnablePromptRender bool // prompt 渲染是否使用
}
