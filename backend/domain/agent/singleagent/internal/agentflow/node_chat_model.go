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

package agentflow

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino-ext/components/model/deepseek"
	"github.com/cloudwego/eino-ext/libs/acl/openai"

	"github.com/coze-dev/coze-studio/backend/api/model/app/bot_common"
	"github.com/coze-dev/coze-studio/backend/infra/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/modelmgr"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type config struct {
	modelFactory      chatmodel.Factory
	modelInfo         *modelmgr.Model
	agentModelSetting *bot_common.ModelInfo
}

func newChatModel(ctx context.Context, conf *config) (chatmodel.ToolCallingChatModel, error) {

	if conf.modelInfo == nil {
		return nil, fmt.Errorf("model is nil")
	}
	modelDetail := conf.modelInfo
	modelMeta := modelDetail.Meta

	if !conf.modelFactory.SupportProtocol(modelMeta.Protocol) {
		return nil, errorx.New(errno.ErrAgentSupportedChatModelProtocol,
			errorx.KV("protocol", string(modelMeta.Protocol)))
	}
	logs.CtxInfof(ctx, "chatModel-before: %v", conv.DebugJsonToStr(modelDetail.Meta.ConnConfig))
	if conf.agentModelSetting != nil {
		if conf.agentModelSetting.TopP != nil {
			modelDetail.Meta.ConnConfig.TopP = ptr.Of(float32(*conf.agentModelSetting.TopP))
		}
		if conf.agentModelSetting.Temperature != nil {
			modelDetail.Meta.ConnConfig.Temperature = ptr.Of(float32(*conf.agentModelSetting.Temperature))
		}
		if conf.agentModelSetting.MaxTokens != nil {
			modelDetail.Meta.ConnConfig.MaxTokens = ptr.Of(int(*conf.agentModelSetting.MaxTokens))
		}
		if conf.agentModelSetting.ResponseFormat != nil {
			modelDetail.Meta = parseResponseFormat(conf.agentModelSetting.ResponseFormat, modelMeta)
		}

	}
	logs.CtxInfof(ctx, "chatModel-after: %v", conv.DebugJsonToStr(modelDetail.Meta.ConnConfig))

	cm, err := conf.modelFactory.CreateChatModel(ctx, modelDetail.Meta.Protocol, conf.modelInfo.Meta.ConnConfig)
	if err != nil {
		return nil, err
	}

	return cm, nil
}

func parseResponseFormat(responseFormat *bot_common.ModelResponseFormat, modelMeta modelmgr.ModelMeta) modelmgr.ModelMeta {
	if responseFormat == nil {
		return modelMeta
	}

	switch modelMeta.Protocol {
	case chatmodel.ProtocolOpenAI:
		if modelMeta.ConnConfig.OpenAI == nil {
			modelMeta.ConnConfig.Qwen = &chatmodel.QwenConfig{
				ResponseFormat: &openai.ChatCompletionResponseFormat{
					Type: responseFormatToOpenai(responseFormat),
				},
			}
		} else {
			if modelMeta.ConnConfig.OpenAI.ResponseFormat == nil {
				modelMeta.ConnConfig.OpenAI.ResponseFormat = &openai.ChatCompletionResponseFormat{
					Type: responseFormatToOpenai(responseFormat),
				}
			} else {
				modelMeta.ConnConfig.OpenAI.ResponseFormat.Type = responseFormatToOpenai(responseFormat)
			}
		}
	case chatmodel.ProtocolDeepseek:
		if modelMeta.ConnConfig.Deepseek == nil {
			modelMeta.ConnConfig.Deepseek = &chatmodel.DeepseekConfig{
				ResponseFormatType: responseFormatToDeepseek(responseFormat),
			}
		} else {
			modelMeta.ConnConfig.Deepseek.ResponseFormatType = responseFormatToDeepseek(responseFormat)
		}
	case chatmodel.ProtocolQwen:
		if modelMeta.ConnConfig.Qwen == nil {
			modelMeta.ConnConfig.Qwen = &chatmodel.QwenConfig{
				ResponseFormat: &openai.ChatCompletionResponseFormat{
					Type: responseFormatToOpenai(responseFormat),
				},
			}
		} else {
			if modelMeta.ConnConfig.Qwen.ResponseFormat == nil {
				modelMeta.ConnConfig.Qwen.ResponseFormat = &openai.ChatCompletionResponseFormat{
					Type: responseFormatToOpenai(responseFormat),
				}
			} else {
				modelMeta.ConnConfig.Qwen.ResponseFormat.Type = responseFormatToOpenai(responseFormat)
			}
		}

	default:
		return modelMeta
	}
	return modelMeta
}

func responseFormatToDeepseek(responseFormat *bot_common.ModelResponseFormat) deepseek.ResponseFormatType {
	var deepseekResponseFormatType deepseek.ResponseFormatType = deepseek.ResponseFormatTypeText
	if responseFormat == nil {
		return deepseekResponseFormatType
	}
	switch *responseFormat {
	case bot_common.ModelResponseFormat_Text:
		deepseekResponseFormatType = deepseek.ResponseFormatTypeText
	case bot_common.ModelResponseFormat_JSON:
		deepseekResponseFormatType = deepseek.ResponseFormatTypeJSONObject
	}
	return deepseekResponseFormatType
}

func responseFormatToOpenai(responseFormat *bot_common.ModelResponseFormat) openai.ChatCompletionResponseFormatType {

	openaiResponseFormatType := openai.ChatCompletionResponseFormatTypeText
	if responseFormat == nil {
		return openaiResponseFormatType
	}
	switch *responseFormat {
	case bot_common.ModelResponseFormat_Text:
		openaiResponseFormatType = openai.ChatCompletionResponseFormatTypeText
	case bot_common.ModelResponseFormat_JSON:
		openaiResponseFormatType = openai.ChatCompletionResponseFormatTypeJSONObject
	}

	return openaiResponseFormatType
}

func loadModelInfo(ctx context.Context, manager modelmgr.Manager, modelID int64) (*modelmgr.Model, error) {
	if modelID == 0 {
		return nil, fmt.Errorf("modelID is required")
	}

	models, err := manager.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs: []int64{modelID},
	})

	if err != nil {
		return nil, fmt.Errorf("MGetModelByID failed, err=%w", err)
	}
	if len(models) == 0 {
		return nil, fmt.Errorf("model not found, modelID=%v", modelID)
	}

	return models[0], nil
}
