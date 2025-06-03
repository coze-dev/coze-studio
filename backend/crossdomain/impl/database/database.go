package database

import (
	"context"

	model "code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossdatabase"
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

func (c *databaseImpl) ExecuteSQL(ctx context.Context, req *model.ExecuteSQLRequest) (*model.ExecuteSQLResponse, error) {
	return c.DomainSVC.ExecuteSQL(ctx, req)
}

func (c *databaseImpl) PublishDatabase(ctx context.Context, req *model.PublishDatabaseRequest) (resp *model.PublishDatabaseResponse, err error) {
	return c.DomainSVC.PublishDatabase(ctx, req)
}

func (c *databaseImpl) DeleteDatabase(ctx context.Context, req *model.DeleteDatabaseRequest) error {
	return c.DomainSVC.DeleteDatabase(ctx, req)
}

func (c *databaseImpl) BindDatabase(ctx context.Context, req *model.BindDatabaseToAgentRequest) error {
	return c.DomainSVC.BindDatabase(ctx, req)
}

func (c *databaseImpl) UnBindDatabase(ctx context.Context, req *model.UnBindDatabaseToAgentRequest) error {
	return c.DomainSVC.UnBindDatabase(ctx, req)
}

func (c *databaseImpl) MGetDatabase(ctx context.Context, req *model.MGetDatabaseRequest) (*model.MGetDatabaseResponse, error) {
	return c.DomainSVC.MGetDatabase(ctx, req)
}
