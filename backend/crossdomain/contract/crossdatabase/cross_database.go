package crossdatabase

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/memory/database/service"
)

// TODO(@fanlv): 参数引用需要修改。
type Database interface {
	ExecuteSQL(ctx context.Context, req *service.ExecuteSQLRequest) (*service.ExecuteSQLResponse, error)
	PublishDatabase(ctx context.Context, req *service.PublishDatabaseRequest) (resp *service.PublishDatabaseResponse, err error)
}

var defaultSVC Database

func DefaultSVC() Database {
	return defaultSVC
}

func SetDefaultSVC(c Database) {
	defaultSVC = c
}
