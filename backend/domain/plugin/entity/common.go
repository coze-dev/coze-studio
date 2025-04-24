package entity

type PageInfo struct {
	Page       int
	Size       int
	SortBy     SortField
	OrderByACS bool
}

type SortField string

const (
	SortByCreatedAt SortField = "created_at"
	SortByUpdatedAt SortField = "updated_at"
)
