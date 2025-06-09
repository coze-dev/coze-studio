package entity

import "code.byted.org/flow/opencoze/backend/api/model/crossdomain/knowledge"

type Knowledge struct {
	*knowledge.Knowledge
}

type WhereKnowledgeOption struct {
	KnowledgeIDs []int64
	AppID        *int64
	SpaceID      *int64
	Name         *string // 完全匹配
	Status       []int32
	UserID       *int64
	Query        *string // 模糊匹配
	Page         *int
	PageSize     *int
	Order        *Order
	OrderType    *OrderType
	FormatType   *int64
}

type OrderType int32

const (
	OrderTypeAsc  OrderType = 1
	OrderTypeDesc OrderType = 2
)

type Order int32

const (
	OrderCreatedAt Order = 1
	OrderUpdatedAt Order = 2
)
