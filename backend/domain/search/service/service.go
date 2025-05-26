package service

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

type AppProjectEventBus interface {
	PublishProject(ctx context.Context, event *entity.ProjectDomainEvent) error
}

type ResourceEventBus interface {
	PublishResources(ctx context.Context, event *entity.ResourceDomainEvent) error
}

type Search interface {
	SearchApps(ctx context.Context, req *entity.SearchAppsRequest) (resp *entity.SearchAppsResponse, err error)
	SearchResources(ctx context.Context, req *entity.SearchResourcesRequest) (resp *entity.SearchResourcesResponse, err error)
}
