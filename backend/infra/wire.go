//go:build wireinject

package infra

import (
	"context"

	"github.com/google/wire"

	"code.byted.org/flow/opencoze/backend/infra-contract/orm"
	"code.byted.org/flow/opencoze/backend/infra/orm/mysql"
)

func InitializeORMProvider(ctx context.Context) (orm.Provider, error) {
	wire.Build(
		mysql.ProviderSet,
	)
	return nil, nil
}
