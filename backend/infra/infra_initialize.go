package infra

import (
	"context"
	"fmt"

	"code.byted.org/flow/opencoze/backend/infra-contract/orm"
)

func InitializeInfra(ctx context.Context) (err error) {

	ormProvider, err := InitializeORMProvider(ctx)
	if err != nil {
		return fmt.Errorf("InitializeORMProvider failed, err=%w", err)
	}
	err = orm.RegisterORMProvider(ormProvider)
	if err != nil {
		return fmt.Errorf("RegisterORMProvider failed, err=%w", err)
	}

	return nil
}
