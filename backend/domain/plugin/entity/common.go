package entity

type PageInfo struct {
	Page       int
	Size       int
	SortBy     *SortField
	OrderByACS *bool
}
