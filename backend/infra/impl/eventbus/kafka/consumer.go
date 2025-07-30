/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package kafka

import (
	"context"
	"time"

	"github.com/IBM/sarama"

	"github.com/coze-dev/coze-studio/backend/infra/contract/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/signal"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type consumerImpl struct {
	broker        string
	topic         string
	groupID       string
	handler       eventbus.ConsumerHandler
	consumerGroup sarama.ConsumerGroup
}

func RegisterConsumer(broker string, topic, groupID string, handler eventbus.ConsumerHandler, opts ...eventbus.ConsumerOpt) error {
	config := sarama.NewConfig()
	config.Consumer.Offsets.Initial = sarama.OffsetOldest // Start consuming from the earliest message
	config.Consumer.Group.Session.Timeout = 30 * time.Second

	o := &eventbus.ConsumerOption{}
	for _, opt := range opts {
		opt(o)
	}
	// TODO: orderly

	consumerGroup, err := sarama.NewConsumerGroup([]string{broker}, groupID, config)
	if err != nil {
		return err
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

	return nil
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

		sess.MarkMessage(msg, "") // TODO: Consumer policies can be configured
	}
	return nil
}
