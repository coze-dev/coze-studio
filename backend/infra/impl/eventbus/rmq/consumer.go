package rmq

import (
	"context"
	"fmt"

	"github.com/apache/rocketmq-client-go/v2"
	"github.com/apache/rocketmq-client-go/v2/consumer"
	"github.com/apache/rocketmq-client-go/v2/primitive"

	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/signal"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

type consumerImpl struct {
	nameServer string
	topic      string
	group      string
	consumer   rocketmq.PushConsumer
	handler    eventbus.ConsumerHandle
}

func NewConsumer(nameServer, topic, group string, consumerHandler eventbus.ConsumerHandle) (eventbus.Consumer, error) {
	if nameServer == "" {
		return nil, fmt.Errorf("name server is empty")
	}
	if topic == "" {
		return nil, fmt.Errorf("topic is empty")
	}

	if group == "" {
		return nil, fmt.Errorf("group is empty")
	}

	if consumerHandler == nil {
		return nil, fmt.Errorf("consumer handler is nil")
	}

	c, _ := rocketmq.NewPushConsumer(
		consumer.WithGroupName(group),
		consumer.WithNsResolver(primitive.NewPassthroughResolver([]string{nameServer})),
	)

	err := c.Subscribe(topic, consumer.MessageSelector{},
		func(ctx context.Context, msgArr ...*primitive.MessageExt) (consumer.ConsumeResult, error) {
			for i := range msgArr {
				msg := &eventbus.Message{
					Topic: msgArr[i].Topic,
					Group: group,
					Body:  msgArr[i].Body,
				}

				err := consumerHandler.HandleMessage(ctx, msg)
				if err != nil {
					return consumer.ConsumeRetryLater, err // TODO: 策略可以可以配置
				}

				fmt.Printf("subscribe callback: %v \n", msgArr[i])
			}

			return consumer.ConsumeSuccess, nil
		})

	if err != nil {
		return nil, err
	}

	go func() {
		signal.WaitExit()
		if err := c.Shutdown(); err != nil {
			logs.Errorf("shutdown consumer error: %s", err.Error())
		}
	}()

	return &consumerImpl{
		nameServer: nameServer,
		topic:      topic,
		group:      group,
		consumer:   c,
		handler:    consumerHandler,
	}, nil
}
