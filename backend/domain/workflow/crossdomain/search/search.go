package search

import (
	"context"
)

type OpType string

const (
	Created OpType = "created"
	Updated OpType = "updated"
	Deleted OpType = "deleted"
)

type PublishStatus int64

const (
	UnPublished PublishStatus = 1
	Published   PublishStatus = 2
)

type Resource struct {
	WorkflowID    int64
	Name          *string
	URI           *string
	Desc          *string
	APPID         *int64
	SpaceID       *int64
	OwnerID       *int64
	PublishStatus *PublishStatus

	CreatedAt   *int64
	UpdatedAt   *int64
	PublishedAt *int64
}

func SetNotifier(n Notifier) {
	notifierImpl = n
}

func GetNotifier() Notifier {
	return notifierImpl
}

var notifierImpl Notifier

//go:generate  mockgen -destination searchmock/search_mock.go --package searchmock -source search.go
type Notifier interface {
	PublishWorkflowResource(ctx context.Context, OpType OpType, event *Resource) error
}
