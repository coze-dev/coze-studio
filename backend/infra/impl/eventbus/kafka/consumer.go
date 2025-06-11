package kafka

import (
	"context"
	"time"

	"github.com/IBM/sarama"

	"code.byted.org/flow/opencoze/backend/infra/contract/eventbus"
	"code.byted.org/flow/opencoze/backend/pkg/lang/signal"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
	"code.byted.org/flow/opencoze/backend/pkg/safego"
)

type consumerImpl struct {
	broker        string
	topic         string
	groupID       string
	handler       eventbus.ConsumerHandler
	consumerGroup sarama.ConsumerGroup
}

func NewConsumer(broker string, topic, groupID string, handler eventbus.ConsumerHandler, opts ...eventbus.ConsumerOpt) (eventbus.Consumer, error) {
	config := sarama.NewConfig()
	config.Consumer.Offsets.Initial = sarama.OffsetOldest // 从最早消息开始消费
	config.Consumer.Group.Session.Timeout = 30 * time.Second

	o := &eventbus.ConsumerOption{}
	for _, opt := range opts {
		opt(o)
	}
	// TODO: orderly

	consumerGroup, err := sarama.NewConsumerGroup([]string{broker}, groupID, config)
	if err != nil {
		return nil, err
	}

	c := &consumerImpl{
		broker:        broker,
		topic:         topic,
		groupID:       groupID,
		handler:       handler,
		consumerGroup: consumerGroup,
	}

	ctx := context.Background()
	safego.Go(ctx, func() {
		for {
			if err := consumerGroup.Consume(ctx, []string{topic}, c); err != nil {
				logs.Errorf("consumer group consume: %v", err)
				break
			}
		}
	})

	safego.Go(ctx, func() {
		signal.WaitExit()

		if err := c.consumerGroup.Close(); err != nil {
			logs.Errorf("consumer group close: %v", err)
		}
	})

	return c, nil
}

func (c *consumerImpl) Setup(sess sarama.ConsumerGroupSession) error {
	return nil
}

func (c *consumerImpl) Cleanup(sess sarama.ConsumerGroupSession) error {
	return nil
}

func (c *consumerImpl) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	ctx := context.Background()

	for msg := range claim.Messages() {
		m := &eventbus.Message{
			Topic: msg.Topic,
			Group: c.groupID,
			Body:  msg.Value,
		}
		if err := c.handler.HandleMessage(ctx, m); err != nil {
			continue
		}

		sess.MarkMessage(msg, "") // TODO: 消费策略可以配置
	}
	return nil
}
