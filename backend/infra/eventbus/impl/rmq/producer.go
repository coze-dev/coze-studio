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
	"github.com/apache/rocketmq-client-go/v2/primitive"
	"github.com/apache/rocketmq-client-go/v2/producer"

	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/signal"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/consts"
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
		producer.WithCredentials(primitive.Credentials{
			AccessKey: os.Getenv(consts.RMQAccessKey),
			SecretKey: os.Getenv(consts.RMQSecretKey),
		}),
		// producer.WithNsResolver(primitive.NewGRPCCredentialsResolver(nil)),
		// producer.WithInstanceName("rocketmq-cnngf291ea363b7a"),
	)
	if err != nil {
		return nil, fmt.Errorf("NewProducer failed, nameServer: %s, topic: %s, err: %w", nameServer, topic, err)
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
