package application

import (
	singleagent2 "code.byted.org/flow/opencoze/backend/crossdomain/agent/singleagent"
	"context"

	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/prompt"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
)

var (
	promptDomainSVC      prompt.Service
	singleAgentDomainSVC singleagent.Service
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

	promptDomainSVC = prompt.NewService(db, idGenSVC)

	singleAgentDomainSVC = singleagent.NewService(&singleagent.Components{
		PluginService: singleagent2.NewPlugin(),
		IDGen:         idGenSVC,
		DB:            db,
	})

	return nil
}
