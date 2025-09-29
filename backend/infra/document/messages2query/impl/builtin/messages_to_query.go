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
	"encoding/json"
	"fmt"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/infra/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/document/messages2query"
)

func NewMessagesToQuery(_ context.Context, model chatmodel.BaseChatModel, template prompt.ChatTemplate) (messages2query.MessagesToQuery, error) {
	return &m2q{model, template}, nil
}

type m2q struct {
	cm  chatmodel.BaseChatModel
	tpl prompt.ChatTemplate
}

func (m *m2q) MessagesToQuery(ctx context.Context, messages []*schema.Message, opts ...messages2query.Option) (newQuery string, err error) {
	o := &messages2query.Options{ChatModel: m.cm}
	for _, opt := range opts {
		opt(o)
	}

	if o.ChatModel == nil {
		return "", fmt.Errorf("[MessagesToQuery] chat model not configured")
	}

	ch := compose.NewChain[[]*schema.Message, string]().
		AppendLambda(compose.InvokableLambda(func(ctx context.Context, input []*schema.Message) (output map[string]any, err error) {
			if len(input) == 0 {
				return nil, fmt.Errorf("no input message")
			}

			b, err := json.MarshalIndent(input, "", "\t")
			if err != nil {
				return nil, err
			}
			return map[string]interface{}{"messages": string(b)}, nil
		})).
		AppendChatTemplate(m.tpl).
		AppendChatModel(o.ChatModel).
		AppendLambda(compose.InvokableLambda(func(ctx context.Context, input *schema.Message) (output string, err error) {
			return input.Content, nil
		}))

	r, err := ch.Compile(ctx)
	if err != nil {
		return "", err
	}

	return r.Invoke(ctx, messages)
}
