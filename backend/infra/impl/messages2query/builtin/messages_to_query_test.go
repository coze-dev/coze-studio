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

package builtin

import (
	"context"
	"testing"

	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
	"github.com/stretchr/testify/assert"
)

func TestM2Q(t *testing.T) {
	ctx := context.Background()
	impl, err := NewMessagesToQuery(ctx, &mockChatModel{}, prompt.FromMessages(schema.Jinja2,
		schema.SystemMessage("system message 123"),
		schema.UserMessage("{{messages}}")))
	assert.NoError(t, err)

	t.Run("test empty messages", func(t *testing.T) {
		q, err := impl.MessagesToQuery(ctx, []*schema.Message{})
		assert.Error(t, err)
		assert.Equal(t, "", q)
	})

	t.Run("test success", func(t *testing.T) {
		q, err := impl.MessagesToQuery(ctx, []*schema.Message{
			schema.UserMessage("hello"),
		})
		assert.NoError(t, err)
		assert.Equal(t, "mock resp", q)
	})

}

type mockChatModel struct{}

func (m mockChatModel) Generate(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.Message, error) {
	return schema.AssistantMessage("mock resp", nil), nil
}

func (m mockChatModel) Stream(ctx context.Context, input []*schema.Message, opts ...model.Option) (*schema.StreamReader[*schema.Message], error) {
	return nil, nil
}

func (m mockChatModel) BindTools(tools []*schema.ToolInfo) error {
	return nil
}
