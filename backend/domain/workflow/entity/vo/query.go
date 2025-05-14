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

type QueryOption struct {
	Name          *string
	WorkflowType  WorkFlowType
	PublishStatus PublishStatus
}
