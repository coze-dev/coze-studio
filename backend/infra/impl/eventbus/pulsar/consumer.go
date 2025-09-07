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

	"github.com/coze-dev/coze-studio/backend/infra/contract/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/signal"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

func RegisterConsumer(serviceURL, topic, group string, consumerHandler eventbus.ConsumerHandler, opts ...eventbus.ConsumerOpt) error {
	if serviceURL == "" {
		return fmt.Errorf("service URL is empty")
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

	// Parse consumer options
	option := &eventbus.ConsumerOption{}
	for _, opt := range opts {
		opt(option)
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
	client, err := pulsar.NewClient(clientOptions)
	if err != nil {
		return fmt.Errorf("create pulsar client failed: %w", err)
	}

	// Configure consumer options
	consumerOptions := pulsar.ConsumerOptions{
		Topic:            topic,
		SubscriptionName: group,
		Type:             pulsar.Exclusive, // Exclusive mode ensures single consumer for message ordering
	}

	// Create consumer
	consumer, err := client.Subscribe(consumerOptions)
	if err != nil {
		client.Close()
		return fmt.Errorf("create pulsar consumer failed: %w", err)
	}

	// Create cancellable context for better resource management
	ctx, cancel := context.WithCancel(context.Background())

	// Start consuming messages in a goroutine
	safego.Go(ctx, func() {
		defer func() {
			consumer.Close()
			client.Close()
		}()

		for {
			select {
			case <-ctx.Done():
				logs.Infof("pulsar consumer stopped for topic: %s, group: %s", topic, group)
				return
			default:
				// Receive message with context timeout
				msg, err := consumer.Receive(ctx)
				if err != nil {
					// Check if context was cancelled
					if ctx.Err() != nil {
						return
					}
					logs.Errorf("receive pulsar message error: %v", err)
					continue
				}

				// Convert to eventbus message
				eventMsg := &eventbus.Message{
					Topic: topic,
					Group: group,
					Body:  msg.Payload(),
				}

				// Handle message with context
				if err := consumerHandler.HandleMessage(ctx, eventMsg); err != nil {
					logs.Errorf("handle pulsar message failed, topic: %s, group: %s, err: %v", topic, group, err)
					// Negative acknowledge on error
					consumer.Nack(msg)
					continue
				}

				// Acknowledge message on success
				consumer.Ack(msg)
			}
		}
	})

	// Handle graceful shutdown
	safego.Go(context.Background(), func() {
		signal.WaitExit()
		logs.Infof("shutting down pulsar consumer for topic: %s, group: %s", topic, group)
		cancel() // Cancel the context to stop consumer loop
		consumer.Close()
		client.Close()
	})

	return nil
}
