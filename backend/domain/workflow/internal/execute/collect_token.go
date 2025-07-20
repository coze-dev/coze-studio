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

package execute

import (
	"context"
	"sync"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"
	callbacks2 "github.com/cloudwego/eino/utils/callbacks"

	"github.com/coze-dev/coze-studio/backend/pkg/safego"
)

type TokenCollector struct {
	Key    string
	Usage  *model.TokenUsage
	wg     sync.WaitGroup
	mu     sync.Mutex
	Parent *TokenCollector
}

func newTokenCollector(key string, parent *TokenCollector) *TokenCollector {
	return &TokenCollector{
		Key:    key,
		Usage:  &model.TokenUsage{},
		Parent: parent,
	}
}

func (t *TokenCollector) addTokenUsage(usage *model.TokenUsage) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.Usage.PromptTokens += usage.PromptTokens
	t.Usage.CompletionTokens += usage.CompletionTokens
	t.Usage.TotalTokens += usage.TotalTokens

	if t.Parent != nil {
		t.Parent.addTokenUsage(usage)
	}
}

func (t *TokenCollector) wait() *model.TokenUsage {
	t.wg.Wait()
	t.mu.Lock()
	usage := &model.TokenUsage{
		PromptTokens:     t.Usage.PromptTokens,
		CompletionTokens: t.Usage.CompletionTokens,
		TotalTokens:      t.Usage.TotalTokens,
	}
	t.mu.Unlock()
	return usage
}

func getTokenCollector(ctx context.Context) *TokenCollector {
	c := GetExeCtx(ctx)
	if c == nil {
		return nil
	}
	return c.TokenCollector
}

func GetTokenCallbackHandler() callbacks.Handler {
	return callbacks2.NewHandlerHelper().ChatModel(&callbacks2.ModelCallbackHandler{
		OnStart: func(ctx context.Context, runInfo *callbacks.RunInfo, input *model.CallbackInput) context.Context {
			c := getTokenCollector(ctx)
			if c == nil {
				return ctx
			}
			c.wg.Add(1)
			return ctx
		},
		OnEnd: func(ctx context.Context, runInfo *callbacks.RunInfo, output *model.CallbackOutput) context.Context {
			c := getTokenCollector(ctx)
			if c == nil {
				return ctx
			}
			if output.TokenUsage == nil {
				c.wg.Done()
				return ctx
			}
			c.addTokenUsage(output.TokenUsage)
			c.wg.Done()
			return ctx
		},
		OnEndWithStreamOutput: func(ctx context.Context, runInfo *callbacks.RunInfo, output *schema.StreamReader[*model.CallbackOutput]) context.Context {
			c := getTokenCollector(ctx)
			if c == nil {
				output.Close()
				return ctx
			}
			safego.Go(ctx, func() {
				defer func() {
					output.Close()
					c.wg.Done()
				}()

				newC := &model.TokenUsage{}

				for {
					chunk, err := output.Recv()
					if err != nil {
						break
					}

					if chunk.TokenUsage == nil {
						continue
					}
					newC.PromptTokens += chunk.TokenUsage.PromptTokens
					newC.CompletionTokens += chunk.TokenUsage.CompletionTokens
					newC.TotalTokens += chunk.TokenUsage.TotalTokens
				}

				c.addTokenUsage(newC)
			})
			return ctx
		},
		OnError: func(ctx context.Context, runInfo *callbacks.RunInfo, runErr error) context.Context {
			c := getTokenCollector(ctx)
			if c == nil {
				return ctx
			}
			c.wg.Done()
			return ctx
		},
	}).Handler()
}
