package entity

type (
	AppType   int64
	AppStatus int64
	OrderBy   string
)

const (
	AppTypeOfAgent   AppType = 1
	AppTypeOfProject AppType = 2
)

const (
	AppStatusOfDeleted    AppStatus = 0
	AppStatusOfUsing      AppStatus = 1
	AppStatusOfBanned     AppStatus = 2
	AppStatusOfMoveFailed AppStatus = 3
	AppStatusOfCopying    AppStatus = 4
)

const (
	OrderByCreateTime     = "create_time"
	OrderByUpdateTime     = "update_time"
	OrderByPublishTime    = "publish_time"
	OrderByToken          = "token_int"
	OrderByMaxPublishTime = "max_publish_time"
)

type Order int

const (
	OrderASC  Order = 1
	OrderDesc Order = 2
)

func (p Order) String() string {
	switch p {
	case OrderASC:
		return "ASC"
	case OrderDesc:
		return "DESC"
	}
	return "<UNSET>"
}

type SearchScope int

const (
	All        = 0
	CreateByMe = 1
)

type SearchRequest struct {
	SpaceID int64
	Name    string
	Status  []AppStatus
	Types   []AppType
	Scope   SearchScope

	IsPublished    bool
	IsFav          bool
	IsRecentlyOpen bool
	OrderBy        OrderBy
	Order          Order

	Cursor string
	Limit  int
}

type AppDocument struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	SpaceID      string `json:"space_id"`
	OwnerID      string `json:"owner_id"`
	Type         string `json:"type"`
	Status       string `json:"status"`
	Visibility   string `json:"visibility"`
	HasPublished string `json:"has_published"`
	CreateTime   int64  `json:"create_time"`
	UpdateTime   int64  `json:"update_time"`
	PublishTime  int64  `json:"publish_time"`
}

type SearchResponse struct {
	HasMore    bool
	NextCursor string

	Data []*AppDocument
}
