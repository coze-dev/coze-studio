package crossdomain

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/memory/database/service"
)

// TODO: crosss domain entity 标准讨论
//
//go:generate  mockgen -destination ../../../../internal/mock/domain/agent/singleagent/database_service_mock.go --package mock -source database.go
type Database interface {
	ExecuteSQL(ctx context.Context, req *service.ExecuteSQLRequest) (*service.ExecuteSQLResponse, error)
	PublishDatabase(ctx context.Context, req *service.PublishDatabaseRequest) (resp *service.PublishDatabaseResponse, err error)
	MGetRelationsByAgentID(ctx context.Context, req *service.MGetRelationsByAgentIDRequest) (*service.MGetRelationsByAgentIDResponse, error)
}
