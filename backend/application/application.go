package application

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain"
	"code.byted.org/flow/opencoze/backend/domain/prompt"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
)

var (
	promptDomainSVC prompt.Service
)

func Init(ctx context.Context) (err error) {
	db, err := mysql.New()
	if err != nil {
		return err
	}

	idGenSVC, err := idgen.New()
	if err != nil {
		return err
	}

	infraClients := domain.InfraClients{
		DB:    db,
		IDGen: idGenSVC,
	}

	promptDomainSVC = prompt.NewService(infraClients)

	return nil
}
