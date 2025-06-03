package consts

type OrderByType int32

const (
	OrderByUpdateTime       OrderByType = 0
	OrderByCreateTime       OrderByType = 1
	OrderByPublishTime      OrderByType = 2
	OrderByFavTime          OrderByType = 3
	OrderByRecentlyOpenTime OrderByType = 4
)
