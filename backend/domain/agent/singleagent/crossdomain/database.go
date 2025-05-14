package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/memory/database"
)

//go:generate  mockgen -destination ../../../../internal/mock/domain/agent/singleagent/database_service_mock.go --package mock -source database.go
type Database interface {
	ExecuteSQL(ctx context.Context, req *database.ExecuteSQLRequest) (*database.ExecuteSQLResponse, error)
}
