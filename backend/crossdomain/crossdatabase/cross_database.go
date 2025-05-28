package crossdatabase

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
)

// TODO(@fanlv): 参数引用需要修改。
type Database interface {
	ExecuteSQL(ctx context.Context, req *service.ExecuteSQLRequest) (*service.ExecuteSQLResponse, error)
	PublishDatabase(ctx context.Context, req *service.PublishDatabaseRequest) (resp *service.PublishDatabaseResponse, err error)
}

var defaultSVC *databaseImpl

type databaseImpl struct {
	DomainSVC database.Database
}

func InitDomainService(c database.Database) {
	defaultSVC = &databaseImpl{
		DomainSVC: c,
	}
}

func DefaultSVC() Database {
	return defaultSVC
}

func (c *databaseImpl) ExecuteSQL(ctx context.Context, req *service.ExecuteSQLRequest) (*service.ExecuteSQLResponse, error) {
	return c.DomainSVC.ExecuteSQL(ctx, req)
}

func (c *databaseImpl) PublishDatabase(ctx context.Context, req *service.PublishDatabaseRequest) (resp *service.PublishDatabaseResponse, err error) {
	return c.DomainSVC.PublishDatabase(ctx, req)
}
