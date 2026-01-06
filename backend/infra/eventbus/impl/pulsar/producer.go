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

package pulsar

import (
	"context"
	"fmt"
	"os"

	"github.com/apache/pulsar-client-go/pulsar"

	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/signal"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

type producerImpl struct {
	topic    string
	client   pulsar.Client
	producer pulsar.Producer
}

func NewProducer(serviceURL, topic, group string) (eventbus.Producer, error) {
	if serviceURL == "" {
		return nil, fmt.Errorf("pulsar service URL is required")
	}
	if topic == "" {
		return nil, fmt.Errorf("topic is required")
	}

	// Prepare client options
	clientOptions := pulsar.ClientOptions{
		URL: serviceURL,
	}

	// Add JWT authentication if token is provided
	if jwtToken := os.Getenv(consts.PulsarJWTToken); jwtToken != "" {
		clientOptions.Authentication = pulsar.NewAuthenticationToken(jwtToken)
	}

	// Create Pulsar client
	logs.Debugf("Creating Pulsar client with URL: %s", serviceURL)
	if jwtToken := os.Getenv(consts.PulsarJWTToken); jwtToken != "" {
		logs.Debugf("Using JWT authentication, token length: %d", len(jwtToken))
	} else {
		logs.Debugf("No JWT token provided")
	}

	client, err := pulsar.NewClient(clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to create pulsar client with URL %s: %w", serviceURL, err)
	}
	logs.Debugf("Pulsar client created successfully")

	// Create producer
	logs.Debugf("Creating producer for topic: %s, group: %s", topic, group)
	producer, err := client.CreateProducer(pulsar.ProducerOptions{
		Topic: topic,
		Name:  fmt.Sprintf("%s-producer", group),
	})
	if err != nil {
		logs.Errorf("Failed to create producer: %v", err)
		client.Close()
		return nil, fmt.Errorf("create pulsar producer failed: %w", err)
	}
	logs.Debugf("Producer created successfully")

	impl := &producerImpl{
		topic:    topic,
		client:   client,
		producer: producer,
	}

	// Handle graceful shutdown
	safego.Go(context.Background(), func() {
		signal.WaitExit()
		impl.close()
	})

	return impl, nil
}

func (p *producerImpl) Send(ctx context.Context, body []byte, opts ...eventbus.SendOpt) error {
	return p.BatchSend(ctx, [][]byte{body}, opts...)
}

func (p *producerImpl) BatchSend(ctx context.Context, bodyArr [][]byte, opts ...eventbus.SendOpt) error {
	option := eventbus.SendOption{}
	for _, opt := range opts {
		opt(&option)
	}

	// Use Pulsar's async send with batch collection for better performance
	type sendResult struct {
		err error
	}

	resultChan := make(chan sendResult, len(bodyArr))
	pendingCount := len(bodyArr)

	for _, body := range bodyArr {
		msg := &pulsar.ProducerMessage{
			Payload: body,
		}

		// Set partition key if sharding key is provided
		if option.ShardingKey != nil {
			msg.Key = *option.ShardingKey
		}

		// Send message asynchronously for better batching performance
		p.producer.SendAsync(ctx, msg, func(messageID pulsar.MessageID, producerMessage *pulsar.ProducerMessage, err error) {
			resultChan <- sendResult{err: err}
		})
	}

	// Wait for all messages to be sent
	for i := 0; i < pendingCount; i++ {
		select {
		case result := <-resultChan:
			if result.err != nil {
				return fmt.Errorf("[pulsarProducer] batch send message failed: %w", result.err)
			}
		case <-ctx.Done():
			return fmt.Errorf("[pulsarProducer] batch send cancelled: %w", ctx.Err())
		}
	}

	return nil
}

func (p *producerImpl) close() {
	if p.producer != nil {
		p.producer.Close()
	}
	if p.client != nil {
		p.client.Close()
	}
}
