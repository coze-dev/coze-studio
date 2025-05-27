package crossdomain

import (
	"context"

	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
)

type DatabaseService interface {
	DeleteDatabase(ctx context.Context, req *database.DeleteDatabaseRequest) error
}
