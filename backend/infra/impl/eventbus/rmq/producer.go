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
)

type producerImpl struct {
	nameServer string
	topic      string
	p          rocketmq.Producer
}

func NewProducer(nameServer, topic string, retries int) (eventbus.Producer, error) {
	if nameServer == "" {
		return nil, fmt.Errorf("name server is empty")
	}
	if topic == "" {
		return nil, fmt.Errorf("topic is empty")
	}

	p, err := rocketmq.NewProducer(
		producer.WithNsResolver(primitive.NewPassthroughResolver([]string{nameServer})),
		producer.WithRetry(retries),
	)

	if err != nil {
		return nil, err
	}

	err = p.Start()
	if err != nil {
		return nil, fmt.Errorf("start producer error: %s", err.Error())
	}

	go func() {
		signal.WaitExit()
		if err := p.Shutdown(); err != nil {
			logs.Errorf("shutdown producer error: %s", err.Error())
		}
	}()

	return &producerImpl{
		nameServer: nameServer,
		topic:      topic,
		p:          p,
	}, nil
}

func (r *producerImpl) Send(ctx context.Context, body []byte) error {
	_, err := r.p.SendSync(context.Background(), primitive.NewMessage(r.topic, body))
	return err
}

func (r *producerImpl) BatchSend(ctx context.Context, bodyArr [][]byte) error {
	var msgArr []*primitive.Message
	for _, body := range bodyArr {
		msgArr = append(msgArr, primitive.NewMessage(r.topic, body))
	}

	_, err := r.p.SendSync(ctx, msgArr...)
	return err
}
