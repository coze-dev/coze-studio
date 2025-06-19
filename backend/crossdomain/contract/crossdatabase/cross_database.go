package crossdatabase

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
)

type Database interface {
	ExecuteSQL(ctx context.Context, req *database.ExecuteSQLRequest) (*database.ExecuteSQLResponse, error)
	PublishDatabase(ctx context.Context, req *database.PublishDatabaseRequest) (resp *database.PublishDatabaseResponse, err error)
	DeleteDatabase(ctx context.Context, req *database.DeleteDatabaseRequest) error
	BindDatabase(ctx context.Context, req *database.BindDatabaseToAgentRequest) error
	UnBindDatabase(ctx context.Context, req *database.UnBindDatabaseToAgentRequest) error
	MGetDatabase(ctx context.Context, req *database.MGetDatabaseRequest) (*database.MGetDatabaseResponse, error)
	GetAllDatabaseByAppID(ctx context.Context, req *database.GetAllDatabaseByAppIDRequest) (*database.GetAllDatabaseByAppIDResponse, error)
}

var defaultSVC Database

func DefaultSVC() Database {
	return defaultSVC
}

func SetDefaultSVC(c Database) {
	defaultSVC = c
}
