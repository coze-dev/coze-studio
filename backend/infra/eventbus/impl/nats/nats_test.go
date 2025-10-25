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
	"os"
	"sync"
	"testing"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/stretchr/testify/assert"

	"github.com/coze-dev/coze-studio/backend/infra/eventbus"
	"github.com/coze-dev/coze-studio/backend/types/consts"
)

var serviceURL = "nats://localhost:4222"

func TestNATSProducer(t *testing.T) {
	if os.Getenv("NATS_LOCAL_TEST") != "true" {
		return
	}

	// Set up NATS connection options
	opts := []nats.Option{nats.Name("test-producer")}

	// Add authentication if provided
	if jwtToken := os.Getenv(consts.NATSJWTToken); jwtToken != "" {
		opts = append(opts, nats.UserJWT(func() (string, error) {
			return jwtToken, nil
		}, func(nonce []byte) ([]byte, error) {
			return []byte(os.Getenv(consts.NATSNKeySeed)), nil
		}))
	} else if username := os.Getenv(consts.NATSUsername); username != "" {
		password := os.Getenv(consts.NATSPassword)
		opts = append(opts, nats.UserInfo(username, password))
	} else if token := os.Getenv(consts.NATSToken); token != "" {
		opts = append(opts, nats.Token(token))
	}

	nc, err := nats.Connect(serviceURL, opts...)
	assert.NoError(t, err)
	defer nc.Close()

	// Test core NATS publishing
	err = nc.Publish("test.subject", []byte("hello from core NATS"))
	assert.NoError(t, err)
	t.Log("Message sent via core NATS")

	// Test JetStream publishing if enabled
	if os.Getenv(consts.NATSUseJetStream) == "true" {
		js, err := nc.JetStream()
		assert.NoError(t, err)

		// Ensure stream exists
		_, err = js.AddStream(&nats.StreamConfig{
			Name:     "TEST_STREAM",
			Subjects: []string{"test.jetstream.>"},
		})
		if err != nil && err != nats.ErrStreamNameAlreadyInUse {
			assert.NoError(t, err)
		}

		_, err = js.Publish("test.jetstream.subject", []byte("hello from JetStream"))
		assert.NoError(t, err)
		t.Log("Message sent via JetStream")
	}
}

func TestNATSConsumer(t *testing.T) {
	if os.Getenv("NATS_LOCAL_TEST") != "true" {
		return
	}

	// Set up NATS connection options
	opts := []nats.Option{nats.Name("test-consumer")}

	// Add authentication if provided
	if jwtToken := os.Getenv(consts.NATSJWTToken); jwtToken != "" {
		opts = append(opts, nats.UserJWT(func() (string, error) {
			return jwtToken, nil
		}, func(nonce []byte) ([]byte, error) {
			return []byte(os.Getenv(consts.NATSNKeySeed)), nil
		}))
	} else if username := os.Getenv(consts.NATSUsername); username != "" {
		password := os.Getenv(consts.NATSPassword)
		opts = append(opts, nats.UserInfo(username, password))
	} else if token := os.Getenv(consts.NATSToken); token != "" {
		opts = append(opts, nats.Token(token))
	}

	nc, err := nats.Connect(serviceURL, opts...)
	assert.NoError(t, err)
	defer nc.Close()

	// Test core NATS subscription
	t.Run("CoreNATSConsumer", func(t *testing.T) {
		wg := sync.WaitGroup{}
		wg.Add(1)

		// Subscribe to messages
		sub, err := nc.QueueSubscribe("test.subject", "test-queue", func(msg *nats.Msg) {
			defer wg.Done()
			t.Logf("Received core NATS message: %s", string(msg.Data))
			assert.Equal(t, "hello from core NATS", string(msg.Data))
		})
		assert.NoError(t, err)
		defer sub.Unsubscribe()

		// Send a test message
		err = nc.Publish("test.subject", []byte("hello from core NATS"))
		assert.NoError(t, err)

		// Wait for message with timeout
		done := make(chan struct{})
		go func() {
			wg.Wait()
			close(done)
		}()

		select {
		case <-done:
			// Success
		case <-time.After(5 * time.Second):
			t.Error("Timeout waiting for core NATS message")
		}
	})

	// Test JetStream subscription if enabled
	if os.Getenv(consts.NATSUseJetStream) == "true" {
		t.Run("JetStreamConsumer", func(t *testing.T) {
			js, err := nc.JetStream()
			assert.NoError(t, err)

			// Ensure stream exists
			_, err = js.AddStream(&nats.StreamConfig{
				Name:     "TEST_STREAM",
				Subjects: []string{"test.jetstream.>"},
			})
			if err != nil && err != nats.ErrStreamNameAlreadyInUse {
				assert.NoError(t, err)
			}

			wg := sync.WaitGroup{}
			wg.Add(1)

			// Subscribe to JetStream messages
			sub, err := js.PullSubscribe("test.jetstream.subject", "test-consumer")
			assert.NoError(t, err)
			defer sub.Unsubscribe()

			// Send a test message
			_, err = js.Publish("test.jetstream.subject", []byte("hello from JetStream"))
			assert.NoError(t, err)

			go func() {
				defer wg.Done()
				msgs, err := sub.Fetch(1, nats.MaxWait(5*time.Second))
				if err != nil {
					t.Errorf("Failed to fetch JetStream message: %v", err)
					return
				}
				if len(msgs) > 0 {
					msg := msgs[0]
					t.Logf("Received JetStream message: %s", string(msg.Data))
					assert.Equal(t, "hello from JetStream", string(msg.Data))
					msg.Ack()
				}
			}()

			// Wait for message with timeout
			done := make(chan struct{})
			go func() {
				wg.Wait()
				close(done)
			}()

			select {
			case <-done:
				// Success
			case <-time.After(10 * time.Second):
				t.Error("Timeout waiting for JetStream message")
			}
		})
	}
}

func TestNATSProducerImpl(t *testing.T) {
	if os.Getenv("NATS_LOCAL_TEST") != "true" {
		return
	}

	producer, err := NewProducer(serviceURL, "test.topic", "test-group")
	assert.NoError(t, err)
	// Note: eventbus.Producer interface doesn't have Close method
	// The underlying connection will be closed when the producer is garbage collected

	// Test single message send
	err = producer.Send(context.Background(), []byte("single message test"))
	assert.NoError(t, err)
	t.Log("Single message sent successfully")

	// Test batch message send
	messages := [][]byte{
		[]byte("batch message 1"),
		[]byte("batch message 2"),
	}

	err = producer.BatchSend(context.Background(), messages)
	assert.NoError(t, err)
	t.Log("Batch messages sent successfully")
}

func TestNATSConsumerImpl(t *testing.T) {
	if os.Getenv("NATS_LOCAL_TEST") != "true" {
		return
	}

	// Create a test message handler
	messageReceived := make(chan *eventbus.Message, 1)
	handler := &testHandler{
		messageReceived: messageReceived,
		t:               t,
	}

	// Register consumer
	err := RegisterConsumer(serviceURL, "test.consumer.impl", "test-group", handler)
	assert.NoError(t, err)

	// Send a test message using producer
	producer, err := NewProducer(serviceURL, "test.consumer.impl", "test-group")
	assert.NoError(t, err)
	// Note: eventbus.Producer interface doesn't have Close method
	// The underlying connection will be closed when the producer is garbage collected

	err = producer.Send(context.Background(), []byte("consumer implementation test"))
	assert.NoError(t, err)

	// Wait for message to be received
	select {
	case receivedMsg := <-messageReceived:
		assert.Equal(t, []byte("consumer implementation test"), receivedMsg.Body)
		t.Log("Consumer implementation test passed")
	case <-time.After(10 * time.Second):
		t.Error("Timeout waiting for message in consumer implementation test")
	}
}

// testHandler implements eventbus.ConsumerHandler for testing
type testHandler struct {
	messageReceived chan *eventbus.Message
	t               *testing.T
}

func (h *testHandler) HandleMessage(ctx context.Context, message *eventbus.Message) error {
	h.t.Logf("Handler received message: %s", string(message.Body))
	h.messageReceived <- message
	return nil
}
