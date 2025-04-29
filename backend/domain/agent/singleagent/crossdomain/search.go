package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/search/entity"
)

type DomainNotifier interface {
	PublishApps(ctx context.Context, event *entity.AppDomainEvent) error
}
