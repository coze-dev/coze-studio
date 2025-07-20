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

package intentdetector

import (
	"context"
	"fmt"
	"testing"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
)

type mockChatModel struct {
	topSeed bool
}

func (m mockChatModel) Generate(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	if m.topSeed {
		return &schema.Message{
			Content: "1",
		}, nil
	}
	return &schema.Message{
		Content: `{"classificationId":1,"reason":"高兴"}`,
	}, nil
}

func (m mockChatModel) Stream(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	return nil, nil
}

func (m mockChatModel) BindTools(tools []*schema.ToolInfo) error {
	return nil
}

func TestNewIntentDetector(t *testing.T) {
	ctx := context.Background()
	t.Run("fast mode", func(t *testing.T) {
		dt, err := NewIntentDetector(ctx, &Config{
			Intents:    []string{"高兴", "悲伤"},
			IsFastMode: true,
			ChatModel:  &mockChatModel{topSeed: true},
		})
		assert.Nil(t, err)

		ret, err := dt.Invoke(ctx, map[string]any{
			"query": "我考了100分",
		})
		assert.Nil(t, err)
		assert.Equal(t, ret["classificationId"], int64(1))
	})

	t.Run("full mode", func(t *testing.T) {

		dt, err := NewIntentDetector(ctx, &Config{
			Intents:    []string{"高兴", "悲伤"},
			IsFastMode: false,
			ChatModel:  &mockChatModel{},
		})
		assert.Nil(t, err)

		ret, err := dt.Invoke(ctx, map[string]any{
			"query": "我考了100分",
		})
		fmt.Println(err)
		assert.Nil(t, err)
		fmt.Println(ret)
		assert.Equal(t, ret["classificationId"], float64(1))
		assert.Equal(t, ret["reason"], "高兴")
	})

}
