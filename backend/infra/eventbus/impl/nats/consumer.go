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

package nats

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/signal"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/pkg/safego"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

func RegisterConsumer(serverURL, topic, group string, consumerHandler eventbus.ConsumerHandler, opts ...eventbus.ConsumerOpt) error {
	// Validate input parameters
	if serverURL == "" {
		return fmt.Errorf("NATS server URL is empty")
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

	// Prepare connection options
	natsOptions := []nats.Option{
		nats.Name(fmt.Sprintf("%s-consumer", group)),
		nats.ReconnectWait(2 * time.Second),
		nats.MaxReconnects(-1), // Unlimited reconnects
		nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
			logs.Warnf("NATS consumer disconnected: %v", err)
		}),
		nats.ReconnectHandler(func(nc *nats.Conn) {
			logs.Infof("NATS consumer reconnected to %s", nc.ConnectedUrl())
		}),
	}

	// Add authentication support
	if err := addAuthentication(&natsOptions); err != nil {
		return fmt.Errorf("setup authentication failed: %w", err)
	}

	// Create NATS connection
	nc, err := nats.Connect(serverURL, natsOptions...)
	if err != nil {
		return fmt.Errorf("create NATS connection failed: %w", err)
	}

	// Check if JetStream is enabled
	useJetStream := os.Getenv(consts.NATSUseJetStream) == "true"

	// Create cancellable context for better resource management
	ctx, cancel := context.WithCancel(context.Background())

	if useJetStream {
		// Use JetStream for persistent messaging
		err = startJetStreamConsumer(ctx, nc, topic, group, consumerHandler)
	} else {
		// Use core NATS for simple pub/sub
		err = startCoreConsumer(ctx, nc, topic, group, consumerHandler)
	}

	if err != nil {
		nc.Close()
		cancel() // Cancel context to prevent leak
		return err
	}

	// Handle graceful shutdown
	safego.Go(context.Background(), func() {
		signal.WaitExit()
		logs.Infof("shutting down NATS consumer for topic: %s, group: %s", topic, group)
		cancel() // Cancel the context to stop consumer loop
		nc.Close()
	})

	return nil
}

// startJetStreamConsumer starts a JetStream-based consumer for persistent messaging
func startJetStreamConsumer(ctx context.Context, nc *nats.Conn, topic, group string, consumerHandler eventbus.ConsumerHandler) error {
	// Create JetStream context
	js, err := nc.JetStream()
	if err != nil {
		return fmt.Errorf("create JetStream context failed: %w", err)
	}

	// Ensure Stream exists
	if err := ensureStream(js, topic); err != nil {
		return fmt.Errorf("ensure stream failed: %w", err)
	}

	// Start consuming messages in a goroutine
	safego.Go(ctx, func() {
		defer nc.Close()

		// Create durable pull subscription
		sub, err := js.PullSubscribe(topic, group)
		if err != nil {
			logs.Errorf("create NATS JetStream subscription failed: %v", err)
			return
		}
		defer sub.Unsubscribe()

		for {
			select {
			case <-ctx.Done():
				logs.Infof("NATS JetStream consumer stopped for topic: %s, group: %s", topic, group)
				return
			default:
				// Fetch one message at a time for better control and resource management
				msgs, err := sub.Fetch(1, nats.MaxWait(1*time.Second))
				if err != nil {
					if ctx.Err() != nil {
						return
					}
					// Handle timeout and other non-fatal errors
					if err == nats.ErrTimeout {
						continue
					}
					logs.Errorf("fetch NATS JetStream message error: %v", err)
					continue
				}

				// Process the single message
				if len(msgs) > 0 {
					msg := msgs[0]
					eventMsg := &eventbus.Message{
						Topic: topic,
						Group: group,
						Body:  msg.Data,
					}

					// Handle message with context
					if err := consumerHandler.HandleMessage(ctx, eventMsg); err != nil {
						logs.Errorf("handle NATS JetStream message failed, topic: %s, group: %s, err: %v", topic, group, err)
						// Negative acknowledge on error
						msg.Nak()
						continue
					}

					// Acknowledge message on success
					msg.Ack()
				}
			}
		}
	})

	return nil
}

// startCoreConsumer starts a core NATS consumer for simple pub/sub
func startCoreConsumer(ctx context.Context, nc *nats.Conn, topic, group string, consumerHandler eventbus.ConsumerHandler) error {
	// Start consuming messages in a goroutine
	safego.Go(ctx, func() {
		defer nc.Close()

		// Create queue subscription for load balancing
		sub, err := nc.QueueSubscribe(topic, group, func(msg *nats.Msg) {
			eventMsg := &eventbus.Message{
				Topic: topic,
				Group: group,
				Body:  msg.Data,
			}

			// Handle message with context
			if err := consumerHandler.HandleMessage(ctx, eventMsg); err != nil {
				logs.Errorf("handle NATS core message failed, topic: %s, group: %s, err: %v", topic, group, err)
				// For core NATS, we can't nack, just log the error
				return
			}

			logs.Debugf("successfully processed NATS core message, topic: %s, group: %s", topic, group)
		})

		if err != nil {
			logs.Errorf("create NATS core subscription failed: %v", err)
			return
		}
		defer sub.Unsubscribe()

		// Wait for context cancellation
		<-ctx.Done()
		logs.Infof("NATS core consumer stopped for topic: %s, group: %s", topic, group)
	})

	return nil
}

// addAuthentication adds authentication options to NATS connection
func addAuthentication(options *[]nats.Option) error {
	// JWT authentication with NKey
	if jwtToken := os.Getenv(consts.NATSJWTToken); jwtToken != "" {
		nkeySeed := os.Getenv(consts.NATSNKeySeed)
		if nkeySeed == "" {
			return fmt.Errorf("NATS_NKEY_SEED is required when using JWT authentication")
		}
		*options = append(*options, nats.UserJWTAndSeed(jwtToken, nkeySeed))
		return nil
	}

	// Username/password authentication
	if username := os.Getenv(consts.NATSUsername); username != "" {
		password := os.Getenv(consts.NATSPassword)
		*options = append(*options, nats.UserInfo(username, password))
		return nil
	}

	// Token authentication
	if token := os.Getenv(consts.NATSToken); token != "" {
		*options = append(*options, nats.Token(token))
		return nil
	}

	// No authentication configured
	return nil
}

// ensureStream ensures that a JetStream stream exists for the given subject
func ensureStream(js nats.JetStreamContext, subject string) error {
	// Replace dots and other invalid characters with underscores for stream name
	// NATS stream names cannot contain dots, spaces, or other special characters
	streamName := strings.ReplaceAll(subject, ".", "_") + "_STREAM"

	// Check if Stream already exists
	_, err := js.StreamInfo(streamName)
	if err == nil {
		return nil // Stream already exists
	}

	// Only create stream if it's specifically a "stream not found" error
	if err != nats.ErrStreamNotFound {
		return fmt.Errorf("failed to check stream %s: %w", streamName, err)
	}

	// Create Stream if it doesn't exist
	_, err = js.AddStream(&nats.StreamConfig{
		Name:     streamName,
		Subjects: []string{subject},
		Storage:  nats.FileStorage,   // File storage for persistence
		MaxAge:   24 * time.Hour,     // Retain messages for 24 hours
		MaxMsgs:  1000000,            // Maximum number of messages
		MaxBytes: 1024 * 1024 * 1024, // Maximum storage size (1GB)
	})

	if err != nil {
		return fmt.Errorf("failed to create stream %s: %w", streamName, err)
	}

	logs.Infof("created NATS JetStream stream: %s", streamName)
	return nil
}
