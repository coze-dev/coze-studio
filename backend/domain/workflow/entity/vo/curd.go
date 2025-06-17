package vo

type Page struct {
	Size int32 `json:"size"`
	Page int32 `json:"page"`
}

func (p *Page) Offset() int {
	if p.Page == 0 {
		return 0
	}
	return int((p.Page - 1) * p.Size)
}

func (p *Page) Limit() int {
	return int(p.Size)
}

type PublishStatus string

const (
	UnPublished  PublishStatus = "UnPublished"
	HasPublished PublishStatus = "HasPublished"
)

type WorkFlowType string

const (
	User     WorkFlowType = "user"
	Official WorkFlowType = "official"
)

type QueryToolInfoOption struct {
	Page *Page
	IDs  []int64
}

type Locator uint8

const (
	FromDraft Locator = iota
	FromSpecificVersion
	FromLatestVersion
)

type GetPolicy struct {
	ID       int64
	QType    Locator
	MetaOnly bool
	Version  string
	CommitID string
}

type DeletePolicy struct {
	ID    *int64
	IDs   []int64
	AppID *int64
}

type MGetPolicy struct {
	MetaQuery

	QType    Locator
	MetaOnly bool
	Versions map[int64]string
}
