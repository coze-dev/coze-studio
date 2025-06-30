package entity

type PageInfo struct {
	Name       *string
	Page       int
	Size       int
	SortBy     *SortField
	OrderByACS *bool
}
