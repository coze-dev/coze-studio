package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

type DomainNotifier interface {
	Publish(ctx context.Context, event *entity.DomainEvent) error
}
