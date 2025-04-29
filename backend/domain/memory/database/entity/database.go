package entity

type FieldItem struct {
	Name          string
	Desc          string
	Type          FieldItemType
	MustRequired  bool
	AlterID       int64
	IsSystemField bool
	//ID            int64
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

	ProjectID       int64
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
	OnlineID        *int64
	ExtraInfo       map[string]string
	IsAddedToAgent  *bool
	TableType       *TableType
}

func (d *Database) GetDraftID() int64 {
	if d.DraftID == nil {
		return 0
	}

	return *d.DraftID
}

type SQLParamVal struct {
	ValueType FieldItemType
	ISNull    bool
	Value     *string
	Name      *string
}

// DatabaseFilter 数据库过滤条件
type DatabaseFilter struct {
	CreatorID *int64
	SpaceID   *int64
	TableName *string
}

// Pagination pagination
type Pagination struct {
	Total int64

	Limit  int
	Offset int
}

type DatabaseBasic struct {
	ID            int64
	TableType     TableType
	NeedSysFields bool
}
