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
	"sync"
	"testing"
	"time"

	"github.com/apache/rocketmq-client-go/v2"
	"github.com/apache/rocketmq-client-go/v2/consumer"
	"github.com/apache/rocketmq-client-go/v2/primitive"
	"github.com/apache/rocketmq-client-go/v2/producer"
	"github.com/stretchr/testify/assert"
)

var endpoint = "127.0.0.1:9876"

func TestProducer(t *testing.T) {
	if os.Getenv("RMQ_LOCAL_TEST") != "true" {
		return
	}

	p, err := rocketmq.NewProducer(
		producer.WithNameServer([]string{endpoint}),
		producer.WithRetry(2),
		producer.WithGroupName("test_group"),
	)
	assert.NoError(t, err)
	assert.NoError(t, p.Start())

	result, err := p.SendSync(context.Background(), &primitive.Message{
		Topic: "test_topic",
		Body:  []byte("hello"),
	})
	assert.NoError(t, err)
	fmt.Println(result)
}

func TestConsumer(t *testing.T) {
	if os.Getenv("RMQ_LOCAL_TEST") != "true" {
		return
	}

	c, err := rocketmq.NewPushConsumer(
		consumer.WithNameServer([]string{endpoint}),
		consumer.WithConsumerModel(consumer.Clustering),
		consumer.WithConsumeFromWhere(consumer.ConsumeFromLastOffset),
		consumer.WithConsumerOrder(true),
		consumer.WithGroupName("test_group"),
	)
	assert.NoError(t, err)

	wg := sync.WaitGroup{}
	err = c.Subscribe("test_topic", consumer.MessageSelector{}, func(ctx context.Context, ext ...*primitive.MessageExt) (consumer.ConsumeResult, error) {
		orderlyCtx, _ := primitive.GetOrderlyCtx(ctx)
		fmt.Println(orderlyCtx)

		for i, e := range ext {
			fmt.Println(i, e.Body)
		}

		wg.Done()
		return consumer.ConsumeSuccess, nil
	})
	assert.NoError(t, err)

	err = c.Start()
	assert.NoError(t, err)

	wg.Wait()
	time.Sleep(time.Second)
	_ = c.Shutdown()
}
