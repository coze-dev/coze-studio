package entity

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
	ID          int64
	Name        string
	Description string
	IconURI     string

	CreatorID int64
	SpaceID   int64

	CreatedAtMs int64
	UpdatedAtMs int64
	DeletedAtMs int64

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
