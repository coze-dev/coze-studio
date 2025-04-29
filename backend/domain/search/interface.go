package search

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

type Handler func(ctx context.Context, event *entity.AppDomainEvent) error

type DomainNotifier interface {
	PublishApps(ctx context.Context, event *entity.AppDomainEvent) error
	PublishResources(ctx context.Context, event *entity.ResourceDomainEvent) error
}

type Search interface {
	SearchApps(ctx context.Context, req *entity.SearchAppsRequest) (resp *entity.SearchAppsResponse, err error)
	SearchResources(ctx context.Context, req *entity.SearchResourcesRequest) (resp *entity.SearchResourcesResponse, err error)
}
