package entity

import "code.byted.org/flow/opencoze/backend/domain/common"

type FieldItem struct {
	Name          string
	Desc          string
	Type          FieldItemType
	MustRequired  bool
	ID            int64
	AlterID       int64
	IsSystemField bool
}

type Database struct {
	common.Info

	IconUrl         string
	TableName       string
	TableDesc       string
	Status          TableStatus
	FieldList       []*FieldItem
	ActualTableName string
	RwMode          DatabaseRWMode
	PromptDisabled  bool
	IsVisible       bool
	DraftID         *int64
	ExtraInfo       map[string]string
	IsAddedToAgent  *bool
	TableType       *TableType
}

type SQLParamVal struct {
	ValueType FieldItemType
	ISNull    bool
	Value     *string
	Name      *string
}
