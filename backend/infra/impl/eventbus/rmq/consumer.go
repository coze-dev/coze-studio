package rmq

import (
	"context"
	"fmt"

	"github.com/apache/rocketmq-client-go/v2"
	"github.com/apache/rocketmq-client-go/v2/consumer"
	"github.com/apache/rocketmq-client-go/v2/primitive"
	"github.com/apache/rocketmq-client-go/v2/rlog"

	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/signal"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func RegisterConsumer(nameServer, topic, group string, consumerHandler eventbus.ConsumerHandler, opts ...eventbus.ConsumerOpt) error {
	if nameServer == "" {
		return fmt.Errorf("name server is empty")
	}
	if topic == "" {
		return fmt.Errorf("topic is empty")
	}

	if group == "" {
		return fmt.Errorf("group is empty")
	}

	if consumerHandler == nil {
		return fmt.Errorf("consumer handler is nil")
	}

	rlog.SetLogLevel("warn")

	o := &eventbus.ConsumerOption{}
	for _, opt := range opts {
		opt(o)
	}

	defaultOptions := []consumer.Option{
		consumer.WithGroupName(group),
		consumer.WithNsResolver(primitive.NewPassthroughResolver([]string{nameServer})),
		consumer.WithConsumeFromWhere(consumer.ConsumeFromLastOffset),
	}

	if o.Orderly != nil {
		defaultOptions = append(defaultOptions, consumer.WithConsumerOrder(*o.Orderly))
	}

	c, err := rocketmq.NewPushConsumer(defaultOptions...)
	if err != nil {
		return err
	}

	err = c.Subscribe(topic, consumer.MessageSelector{},
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
		return fmt.Errorf("consumer Subscribe failed, err=%w", err)
	}

	if err = c.Start(); err != nil {
		return fmt.Errorf("consumer Start failed, err=%w", err)
	}

	go func() {
		signal.WaitExit()
		if err := c.Shutdown(); err != nil {
			logs.Errorf("shutdown consumer error: %v", err)
		}
	}()

	return nil
}
