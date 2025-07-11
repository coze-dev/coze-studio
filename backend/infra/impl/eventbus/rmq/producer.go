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
	"time"

	"code.byted.org/data_edc/workflow_engine_next/infra/contract/eventbus"
	"code.byted.org/rocketmq/rocketmq-go-proxy/pkg/config"
	"code.byted.org/rocketmq/rocketmq-go-proxy/pkg/producer"
	"code.byted.org/rocketmq/rocketmq-go-proxy/pkg/types"
)

type producerImpl struct {
	topic string
	p     producer.Producer
}

func NewProducer(psm, clusterName, topic string) (eventbus.Producer, error) {
	if psm == "" {
		return nil, fmt.Errorf("psm is empty")
	}

	if topic == "" {
		return nil, fmt.Errorf("topic is empty")
	}

	cfg := config.NewProducerConfig(psm, clusterName)
	cfg.ProduceTimeout = 1000 * time.Millisecond
	rmqProducer, err := producer.NewProducer(cfg)
	if err != nil {
		panic(fmt.Sprintf("init RMQProducer fail:%v", err.Error()))
	}

	return &producerImpl{
		topic: topic,
		p:     rmqProducer,
	}, nil
}

func (r *producerImpl) Send(ctx context.Context, body []byte, opts ...eventbus.SendOpt) error {
	_, err := r.p.Send(context.Background(), types.NewDefaultMessage(r.topic, body))
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

	var msgArr []*types.Message
	for _, body := range bodyArr {
		msg := types.NewDefaultMessage(r.topic, body)

		if option.ShardingKey != nil {
			msg.WithPartitionKey(*option.ShardingKey)
		}

		msgArr = append(msgArr, msg)
	}

	_, err := r.p.SendBatch(ctx, msgArr)
	return err
}
