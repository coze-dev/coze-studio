package search

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

type Handler func(ctx context.Context, event *entity.DomainEvent) error

type DomainNotifier interface {
	Publish(ctx context.Context, event *entity.DomainEvent) error
}

type Search interface {
	SearchApps(ctx context.Context, req *entity.SearchRequest) (resp *entity.SearchResponse, err error)
}
