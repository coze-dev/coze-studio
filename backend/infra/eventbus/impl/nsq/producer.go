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

package nsq

import (
	"context"
	"fmt"

	"github.com/nsqio/go-nsq"

	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/signal"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type producerImpl struct {
	nameServer string
	topic      string
	p          *nsq.Producer
}

func NewProducer(nameServer, topic, group string) (eventbus.Producer, error) {
	if nameServer == "" {
		return nil, fmt.Errorf("name server is empty")
	}

	if topic == "" {
		return nil, fmt.Errorf("topic is empty")
	}

	config := nsq.NewConfig()

	producer, err := nsq.NewProducer(nameServer, config)
	if err != nil {
		return nil, fmt.Errorf("create producer failed, err=%w", err)
	}

	safego.Go(context.Background(), func() {
		signal.WaitExit()
		producer.Stop()
	})

	return &producerImpl{
		nameServer: nameServer,
		topic:      topic,
		p:          producer,
	}, nil
}

func (r *producerImpl) Send(ctx context.Context, body []byte, opts ...eventbus.SendOpt) error {
	err := r.p.Publish(r.topic, body)
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

	err := r.p.MultiPublish(r.topic, bodyArr)
	if err != nil {
		return fmt.Errorf("[BatchSend] send message failed: %w", err)
	}
	return nil
}
