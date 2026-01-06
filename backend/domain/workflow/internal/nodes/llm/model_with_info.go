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

package llm

import (
	"context"
	"errors"

	"github.com/cloudwego/eino/callbacks"
	"github.com/cloudwego/eino/components"
	"github.com/cloudwego/eino/components/model"
	"github.com/cloudwego/eino/schema"

	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr"
	"github.com/coze-dev/coze-studio/backend/bizpkg/llm/modelbuilder"
	"github.com/coze-dev/coze-studio/backend/domain/workflow/internal/execute"
)

type ModelWithInfo interface {
	modelbuilder.BaseChatModel
	Info(ctx context.Context) *modelmgr.Model
}

type ModelForLLM struct {
	Model         modelbuilder.BaseChatModel
	MInfo         *modelmgr.Model
	FallbackModel modelbuilder.BaseChatModel
	FallbackInfo  *modelmgr.Model
	UseFallback   func(ctx context.Context) bool

	modelEnableCallback    bool
	fallbackEnableCallback bool
}

func NewModel(m modelbuilder.BaseChatModel, info *modelmgr.Model) *ModelForLLM {
	return &ModelForLLM{
		Model: m,
		MInfo: info,
		UseFallback: func(ctx context.Context) bool {
			return false
		},

		modelEnableCallback: components.IsCallbacksEnabled(m),
	}
}

func NewModelWithFallback(m, f modelbuilder.BaseChatModel, info, fInfo *modelmgr.Model) *ModelForLLM {
	return &ModelForLLM{
		Model:         m,
		MInfo:         info,
		FallbackModel: f,
		FallbackInfo:  fInfo,
		UseFallback: func(ctx context.Context) bool {
			exeCtx := execute.GetExeCtx(ctx)
			if exeCtx == nil || exeCtx.NodeCtx == nil {
				return false
			}

			return exeCtx.CurrentRetryCount > 0
		},

		modelEnableCallback:    components.IsCallbacksEnabled(m),
		fallbackEnableCallback: components.IsCallbacksEnabled(f),
	}
}

func (m *ModelForLLM) Generate(ctx context.Context, input []*schema.Message, opts ...model.Option) (
	output *schema.Message, err error,
) {
	if m.UseFallback(ctx) {
		if !m.fallbackEnableCallback {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_ = callbacks.OnEnd(ctx, output)
				}
			}()
			ctx = callbacks.OnStart(ctx, input)
		}
		return m.FallbackModel.Generate(ctx, input, opts...)
	}

	if !m.modelEnableCallback {
		defer func() {
			if err != nil {
				_ = callbacks.OnError(ctx, err)
			} else {
				_ = callbacks.OnEnd(ctx, output)
			}
		}()
		ctx = callbacks.OnStart(ctx, input)
	}
	return m.Model.Generate(ctx, input, opts...)
}

func (m *ModelForLLM) Stream(ctx context.Context, input []*schema.Message, opts ...model.Option) (
	output *schema.StreamReader[*schema.Message], err error,
) {
	if m.UseFallback(ctx) {
		if !m.fallbackEnableCallback {
			defer func() {
				if err != nil {
					_ = callbacks.OnError(ctx, err)
				} else {
					_, output = callbacks.OnEndWithStreamOutput(ctx, output)
				}
			}()
			ctx = callbacks.OnStart(ctx, input)
		}
		return m.FallbackModel.Stream(ctx, input, opts...)
	}

	if !m.modelEnableCallback {
		defer func() {
			if err != nil {
				_ = callbacks.OnError(ctx, err)
			} else {
				_, output = callbacks.OnEndWithStreamOutput(ctx, output)
			}
		}()
		ctx = callbacks.OnStart(ctx, input)
	}
	return m.Model.Stream(ctx, input, opts...)
}

func (m *ModelForLLM) WithTools(tools []*schema.ToolInfo) (model.ToolCallingChatModel, error) {
	toolModel, ok := m.Model.(model.ToolCallingChatModel)
	if !ok {
		return nil, errors.New("requires a ToolCallingChatModel to use with tools")
	}

	var err error
	toolModel, err = toolModel.WithTools(tools)
	if err != nil {
		return nil, err
	}

	var fallbackToolModel model.ToolCallingChatModel
	if m.FallbackModel != nil {
		fallbackToolModel, ok = m.FallbackModel.(model.ToolCallingChatModel)
		if !ok {
			return nil, errors.New("requires a ToolCallingChatModel to use with tools")
		}

		fallbackToolModel, err = fallbackToolModel.WithTools(tools)
		if err != nil {
			return nil, err
		}
	}

	return &ModelForLLM{
		Model:                  toolModel,
		MInfo:                  m.MInfo,
		FallbackModel:          fallbackToolModel,
		FallbackInfo:           m.FallbackInfo,
		UseFallback:            m.UseFallback,
		modelEnableCallback:    m.modelEnableCallback,
		fallbackEnableCallback: m.fallbackEnableCallback,
	}, nil
}

func (m *ModelForLLM) IsCallbacksEnabled() bool {
	return true
}

func (m *ModelForLLM) Info(ctx context.Context) *modelmgr.Model {
	if m.UseFallback(ctx) {
		return m.FallbackInfo
	}

	return m.MInfo
}
