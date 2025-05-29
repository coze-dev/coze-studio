package crossdatabase

import (
	"context"

	"code.byted.org/flow/opencoze/backend/api/model/crossdomain/database"
)

type Database interface {
	ExecuteSQL(ctx context.Context, req *database.ExecuteSQLRequest) (*database.ExecuteSQLResponse, error)
	PublishDatabase(ctx context.Context, req *database.PublishDatabaseRequest) (resp *database.PublishDatabaseResponse, err error)
}

var defaultSVC Database

func DefaultSVC() Database {
	return defaultSVC
}

func SetDefaultSVC(c Database) {
	defaultSVC = c
}
