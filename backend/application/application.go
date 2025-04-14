package application

import (
	"context"
	"fmt"
	"time"

	singleagentCross "code.byted.org/flow/opencoze/backend/crossdomain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/agent/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/permission"
	"code.byted.org/flow/opencoze/backend/domain/prompt"
	"code.byted.org/flow/opencoze/backend/domain/session"
	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/infra/impl/cache/redis"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/kafka"
	"code.byted.org/flow/opencoze/backend/infra/impl/eventbus/rmq"
	"code.byted.org/flow/opencoze/backend/infra/impl/idgen"
	"code.byted.org/flow/opencoze/backend/infra/impl/mysql"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

var (
	promptDomainSVC      prompt.Prompt
	singleAgentDomainSVC singleagent.SingleAgent
	sessionDomainSVC     session.Session
	permissionDomainSVC  permission.Permission
	p1                   eventbus.Producer
	c1                   eventbus.Consumer
	p2                   eventbus.Producer
	c2                   eventbus.Consumer
)

func Init(ctx context.Context) (err error) {
	db, err := mysql.New()
	if err != nil {
		return err
	}

	p2, err = rmq.NewProducer("127.0.0.1:9876", "opencoze_topic", 3)
	if err != nil {
		return err
	}

	c2, err = rmq.NewConsumer("127.0.0.1:9876", "opencoze_topic", "group_a", &singleAgentEventBus{})
	if err != nil {
		return err
	}

	err = p2.Send(ctx, []byte(fmt.Sprintf("hello rmq %v", time.Now())))
	if err != nil {
		logs.Errorf("send msg failed, err: %v", err)
	}

	p1, err = kafka.NewProducer("127.0.0.1:9092", "opencoze_topic")
	if err != nil {
		return err
	}

	c1, err = kafka.NewConsumer("127.0.0.1:9092", "opencoze_topic", "group_a", &singleAgentEventBus{})
	if err != nil {
		return err
	}

	// TODO: just for test, remove me later
	err = p1.Send(ctx, []byte(fmt.Sprintf("hello world %v", time.Now())))
	if err != nil {
		logs.Errorf("send msg failed, err: %v", err)
	}

	cacheCli := redis.New()

	idGenSVC, err := idgen.New(cacheCli)
	if err != nil {
		return err
	}

	promptDomainSVC = prompt.NewService(db, idGenSVC)

	permissionDomainSVC = permission.NewService()

	singleAgentDomainSVC = singleagent.NewService(&singleagent.Components{
		ToolService: singleagentCross.NewTool(),
		IDGen:       idGenSVC,
		DB:          db,
	})

	sessionDomainSVC = session.NewSessionService(cacheCli, idGenSVC)

	return nil
}
