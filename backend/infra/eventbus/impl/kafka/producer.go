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

	"github.com/IBM/sarama"

	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/signal"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type producerImpl struct {
	topic string
	p     sarama.SyncProducer
}

func NewProducer(broker, topic string) (eventbus.Producer, error) {
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.Return.Errors = true
	config.Producer.RequiredAcks = sarama.WaitForAll

	producer, err := sarama.NewSyncProducer([]string{broker}, config)
	if err != nil {
		return nil, err
	}

	safego.Go(context.Background(), func() {
		signal.WaitExit()
		if err := producer.Close(); err != nil {
			logs.Errorf("close producer error: %s", err.Error())
		}
	})

	return &producerImpl{
		topic: topic,
		p:     producer,
	}, nil
}

func (r *producerImpl) Send(ctx context.Context, body []byte, opts ...eventbus.SendOpt) error {
	return r.BatchSend(ctx, [][]byte{body}, opts...)
}

func (r *producerImpl) BatchSend(ctx context.Context, bodyArr [][]byte, opts ...eventbus.SendOpt) error {
	option := eventbus.SendOption{}
	for _, opt := range opts {
		opt(&option)
	}

	var msgArr []*sarama.ProducerMessage
	for _, body := range bodyArr {
		msg := &sarama.ProducerMessage{
			Topic: r.topic,
			Value: sarama.ByteEncoder(body),
		}

		if option.ShardingKey != nil {
			msg.Key = sarama.StringEncoder(*option.ShardingKey)
		}

		msgArr = append(msgArr, msg)
	}

	err := r.p.SendMessages(msgArr)
	if err != nil {
		return err
	}

	return nil
}
