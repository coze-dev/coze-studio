package database

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatabase"
	"code.byted.org/flow/opencoze/backend/domain/memory/database/service"
	database "code.byted.org/flow/opencoze/backend/domain/memory/database/service"
)

var defaultSVC crossdatabase.Database

type databaseImpl struct {
	DomainSVC database.Database
}

func InitDomainService(c database.Database) crossdatabase.Database {
	defaultSVC = &databaseImpl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *databaseImpl) ExecuteSQL(ctx context.Context, req *service.ExecuteSQLRequest) (*service.ExecuteSQLResponse, error) {
	return c.DomainSVC.ExecuteSQL(ctx, req)
}

func (c *databaseImpl) PublishDatabase(ctx context.Context, req *service.PublishDatabaseRequest) (resp *service.PublishDatabaseResponse, err error) {
	return c.DomainSVC.PublishDatabase(ctx, req)
}
