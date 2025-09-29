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

package impl

import (
	"fmt"
	"os"

	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus/impl/kafka"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus/impl/nsq"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus/impl/pulsar"
	"github.com/coze-dev/coze-studio/backend/infra/eventbus/impl/rmq"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type (
	Producer        = eventbus.Producer
	ConsumerService = eventbus.ConsumerService
	ConsumerHandler = eventbus.ConsumerHandler
	ConsumerOpt     = eventbus.ConsumerOpt
	Message         = eventbus.Message
)

type consumerServiceImpl struct{}

func NewConsumerService() ConsumerService {
	return &consumerServiceImpl{}
}

func DefaultSVC() ConsumerService {
	return eventbus.GetDefaultSVC()
}

func (consumerServiceImpl) RegisterConsumer(nameServer, topic, group string, consumerHandler eventbus.ConsumerHandler, opts ...eventbus.ConsumerOpt) error {
	tp := os.Getenv(consts.MQTypeKey)
	switch tp {
	case "nsq":
		return nsq.RegisterConsumer(nameServer, topic, group, consumerHandler, opts...)
	case "kafka":
		return kafka.RegisterConsumer(nameServer, topic, group, consumerHandler, opts...)
	case "rmq":
		return rmq.RegisterConsumer(nameServer, topic, group, consumerHandler, opts...)
	case "pulsar":
		return pulsar.RegisterConsumer(nameServer, topic, group, consumerHandler, opts...)
	}

	return fmt.Errorf("invalid mq type: %s , only support nsq, kafka, rmq, pulsar", tp)
}

func NewProducer(nameServer, topic, group string, retries int) (eventbus.Producer, error) {
	tp := os.Getenv(consts.MQTypeKey)
	switch tp {
	case "nsq":
		return nsq.NewProducer(nameServer, topic, group)
	case "kafka":
		return kafka.NewProducer(nameServer, topic)
	case "rmq":
		return rmq.NewProducer(nameServer, topic, group, retries)
	case "pulsar":
		return pulsar.NewProducer(nameServer, topic, group)
	}

	return nil, fmt.Errorf("invalid mq type: %s , only support nsq, kafka, rmq, pulsar", tp)
}

func InitResourceEventBusProducer() (eventbus.Producer, error) {
	nameServer := os.Getenv(consts.MQServer)
	resourceEventBusProducer, err := NewProducer(nameServer,
		consts.RMQTopicResource, consts.RMQConsumeGroupResource, 1)
	if err != nil {
		return nil, fmt.Errorf("init resource producer failed, err=%w", err)
	}

	return resourceEventBusProducer, nil
}

func InitAppEventProducer() (eventbus.Producer, error) {
	nameServer := os.Getenv(consts.MQServer)
	appEventProducer, err := NewProducer(nameServer, consts.RMQTopicApp, consts.RMQConsumeGroupApp, 1)
	if err != nil {
		return nil, fmt.Errorf("init app producer failed, err=%w", err)
	}

	return appEventProducer, nil
}

func InitKnowledgeEventBusProducer() (eventbus.Producer, error) {
	nameServer := os.Getenv(consts.MQServer)

	knowledgeProducer, err := NewProducer(nameServer, consts.RMQTopicKnowledge, consts.RMQConsumeGroupKnowledge, 2)
	if err != nil {
		return nil, fmt.Errorf("init knowledge producer failed, err=%w", err)
	}

	return knowledgeProducer, nil
}
