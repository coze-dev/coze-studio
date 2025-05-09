package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

//go:generate  mockgen -destination ../../../internal/mock/domain/knowledge/search_mock.go --package mock -source search.go
type DomainNotifier interface {
	PublishResources(ctx context.Context, event *entity.ResourceDomainEvent) error
}
