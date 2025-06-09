package entity

// TemplateFilter defines filters for listing templates
type TemplateFilter struct {
	AgentID           *int64
	SpaceID           *int64
	ProductEntityType *int64
}

type Pagination struct {
	Limit  int
	Offset int
}
