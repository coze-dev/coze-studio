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

	"code.byted.org/data_edc/workflow_engine_next/infra/contract/eventbus"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/conv"
	"code.byted.org/data_edc/workflow_engine_next/pkg/lang/signal"
	"code.byted.org/data_edc/workflow_engine_next/pkg/safego"
	"code.byted.org/gopkg/logs"
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

	config := nsq.NewConfig()

	consumer, err := nsq.NewConsumer(topic, group, config)
	if err != nil {
		return fmt.Errorf("create consumer failed, err=%w", err)
	}

	consumer.AddHandler(&MessageHandler{
		Topic:           topic,
		Group:           group,
		ConsumerHandler: consumerHandler,
	})

	if err := consumer.ConnectToNSQD(nameServer); err != nil {
		return fmt.Errorf("connect to nsqd failed, err=%w", err)
	}

	safego.Go(context.Background(), func() {
		signal.WaitExit()
		consumer.Stop()
	})

	return nil
}

// 自定义 Handler，处理收到的每条消息
type MessageHandler struct {
	Topic           string
	Group           string
	ConsumerHandler eventbus.ConsumerHandler
}

func (h *MessageHandler) HandleMessage(m *nsq.Message) error {
	msg := &eventbus.Message{
		Topic: h.Topic,
		Group: h.Group,
		Body:  m.Body,
	}

	logs.Debugf("[Subscribe] receive msg : %v \n", conv.DebugJsonToStr(msg))
	err := h.ConsumerHandler.HandleMessage(context.Background(), msg)
	if err != nil {
		logs.Errorf("[Subscribe] handle msg failed, topic : %s , group : %s, err: %v \n", msg.Topic, msg.Group, err)
		return err
	}

	logs.Debugf("subscribe callback: %v \n", conv.DebugJsonToStr(msg))

	return nil
}
