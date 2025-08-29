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

package internal

import (
	"sync"
	"testing"

	"github.com/cloudwego/eino/schema"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/entity"
	"github.com/stretchr/testify/assert"
)

// TestSendStreamDoneEventOnlyOnce 测试 SendStreamDoneEvent 只发送一次
func TestSendStreamDoneEventOnlyOnce(t *testing.T) {
	// 创建一个新的Event实例
	event := NewMessageEvent()
	
	// 创建一个模拟的StreamWriter
	sr, sw := schema.Pipe[*entity.AgentRunResponse](10)
	defer sw.Close()
	
	// 记录接收到的done事件数量
	var doneCount int
	var mu sync.Mutex
	
	// 启动一个goroutine来接收事件
	go func() {
		for {
			resp, err := sr.Recv()
			if err != nil {
				return
			}
			if resp.Event == entity.RunEventStreamDone {
				mu.Lock()
				doneCount++
				mu.Unlock()
			}
		}
	}()
	
	// 多次调用SendStreamDoneEvent
	for i := 0; i < 5; i++ {
		event.SendStreamDoneEvent(sw)
	}
	
	// 等待一下确保事件被处理
	sw.Close()
	
	// 验证只发送了一次done事件
	mu.Lock()
	assert.Equal(t, 1, doneCount, "应该只发送一次done事件")
	mu.Unlock()
}

// TestSendStreamDoneEventConcurrent 测试并发调用SendStreamDoneEvent
func TestSendStreamDoneEventConcurrent(t *testing.T) {
	// 创建一个新的Event实例
	event := NewMessageEvent()
	
	// 创建一个模拟的StreamWriter
	sr, sw := schema.Pipe[*entity.AgentRunResponse](100)
	defer sw.Close()
	
	// 记录接收到的done事件数量
	var doneCount int
	var mu sync.Mutex
	
	// 启动一个goroutine来接收事件
	go func() {
		for {
			resp, err := sr.Recv()
			if err != nil {
				return
			}
			if resp.Event == entity.RunEventStreamDone {
				mu.Lock()
				doneCount++
				mu.Unlock()
			}
		}
	}()
	
	// 并发调用SendStreamDoneEvent
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			event.SendStreamDoneEvent(sw)
		}()
	}
	
	// 等待所有goroutine完成
	wg.Wait()
	sw.Close()
	
	// 验证只发送了一次done事件
	mu.Lock()
	assert.Equal(t, 1, doneCount, "并发调用时也应该只发送一次done事件")
	mu.Unlock()
}