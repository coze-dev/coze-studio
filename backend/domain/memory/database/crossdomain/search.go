package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

//go:generate mockgen -destination  ../../../../internal/mock/domain/memory/database/crossdomain/search.go  --package database  -source search.go
type ResourceDomainNotifier interface {
	PublishResources(ctx context.Context, event *entity.ResourceDomainEvent) error
}
