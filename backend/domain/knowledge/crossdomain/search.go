package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

type DomainNotifier interface {
	PublishResources(ctx context.Context, event *entity.ResourceDomainEvent) error
}
