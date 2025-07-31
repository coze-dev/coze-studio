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

package rmq

import (
	"context"
	"fmt"
	"os"

	"github.com/apache/rocketmq-client-go/v2"
	"github.com/apache/rocketmq-client-go/v2/consumer"
	"github.com/apache/rocketmq-client-go/v2/primitive"
	"github.com/apache/rocketmq-client-go/v2/rlog"

	"github.com/coze-dev/coze-studio/backend/infra/contract/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/signal"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/consts"
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

	rlog.SetLogLevel("error")

	o := &eventbus.ConsumerOption{}
	for _, opt := range opts {
		opt(o)
	}

	defaultOptions := []consumer.Option{
		consumer.WithGroupName(group),
		consumer.WithNsResolver(primitive.NewPassthroughResolver([]string{nameServer})),
		consumer.WithConsumeFromWhere(consumer.ConsumeFromLastOffset),
		consumer.WithCredentials(primitive.Credentials{
			AccessKey: os.Getenv(consts.RMQAccessKey),
			SecretKey: os.Getenv(consts.RMQSecretKey),
		}),
	}

	if o.Orderly != nil {
		defaultOptions = append(defaultOptions, consumer.WithConsumerOrder(*o.Orderly))
	}

	c, err := rocketmq.NewPushConsumer(defaultOptions...)
	if err != nil {
		return fmt.Errorf("[RegisterConsumer] nameServer: %s, topic: %s, group : %s, err: %w", nameServer, topic, group, err)
	}

	err = c.Subscribe(topic, consumer.MessageSelector{},
		func(ctx context.Context, msgArr ...*primitive.MessageExt) (consumer.ConsumeResult, error) {
			for i := range msgArr {

				msg := &eventbus.Message{
					Topic: msgArr[i].Topic,
					Group: group,
					Body:  msgArr[i].Body,
				}

				logs.CtxDebugf(ctx, "[Subscribe] receive msg : %v \n", conv.DebugJsonToStr(msg))
				err = consumerHandler.HandleMessage(ctx, msg)
				if err != nil {
					logs.CtxErrorf(ctx, "[Subscribe] handle msg failed, topic : %s , group : %s, err: %v \n", msg.Topic, msg.Group, err)
					return consumer.ConsumeRetryLater, err // TODO: Policies can be configured
				}

				fmt.Printf("subscribe callback: %v \n", msgArr[i])
			}

			return consumer.ConsumeSuccess, nil
		})
	if err != nil {
		return fmt.Errorf("consumer Subscribe failed, err=%w", err)
	}

	if err = c.Start(); err != nil {
		return fmt.Errorf("[RegisterConsumer-Start] nameServer: %s, topic: %s, group : %s, err: %w", nameServer, topic, group, err)
	}

	safego.Go(context.Background(), func() {
		signal.WaitExit()
		if err := c.Shutdown(); err != nil {
			logs.Errorf("shutdown consumer error: %v", err)
		}
	})

	return nil
}
