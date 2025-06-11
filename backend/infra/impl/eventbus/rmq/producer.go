package rmq

import (
	"context"
	"fmt"

	"github.com/apache/rocketmq-client-go/v2"
	"github.com/apache/rocketmq-client-go/v2/primitive"
	"github.com/apache/rocketmq-client-go/v2/producer"

	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/signal"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/safego"
)

type producerImpl struct {
	nameServer string
	topic      string
	p          rocketmq.Producer
}

func NewProducer(nameServer, topic, group string, retries int) (eventbus.Producer, error) {
	if nameServer == "" {
		return nil, fmt.Errorf("name server is empty")
	}

	if topic == "" {
		return nil, fmt.Errorf("topic is empty")
	}

	p, err := rocketmq.NewProducer(
		producer.WithNsResolver(primitive.NewPassthroughResolver([]string{nameServer})),
		producer.WithRetry(retries),
		producer.WithGroupName(group),
	)
	if err != nil {
		return nil, fmt.Errorf("NewProducer failed: %w", err)
	}

	err = p.Start()
	if err != nil {
		return nil, fmt.Errorf("start producer error: %w", err)
	}

	safego.Go(context.Background(), func() {
		signal.WaitExit()
		if err := p.Shutdown(); err != nil {
			logs.Errorf("shutdown producer error: %s", err.Error())
		}
	})

	return &producerImpl{
		nameServer: nameServer,
		topic:      topic,
		p:          p,
	}, nil
}

func (r *producerImpl) Send(ctx context.Context, body []byte, opts ...eventbus.SendOpt) error {
	_, err := r.p.SendSync(context.Background(), primitive.NewMessage(r.topic, body))
	if err != nil {
		return fmt.Errorf("[producerImpl] send message failed: %w", err)
	}
	return err
}

func (r *producerImpl) BatchSend(ctx context.Context, bodyArr [][]byte, opts ...eventbus.SendOpt) error {
	option := eventbus.SendOption{}
	for _, opt := range opts {
		opt(&option)
	}

	var msgArr []*primitive.Message
	for _, body := range bodyArr {
		msg := primitive.NewMessage(r.topic, body)

		if option.ShardingKey != nil {
			msg.WithShardingKey(*option.ShardingKey)
		}

		msgArr = append(msgArr, msg)
	}

	_, err := r.p.SendSync(ctx, msgArr...)
	return err
}
