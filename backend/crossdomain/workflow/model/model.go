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

package model

import (
	"context"
	"fmt"

	model2 "github.com/cloudwego/eino/components/model"

	"github.com/coze-dev/coze-studio/backend/domain/workflow/crossdomain/model"
	"github.com/coze-dev/coze-studio/backend/infra/contract/chatmodel"
	"github.com/coze-dev/coze-studio/backend/infra/contract/modelmgr"
	chatmodel2 "github.com/coze-dev/coze-studio/backend/infra/impl/chatmodel"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type ModelManager struct {
	modelMgr modelmgr.Manager
	factory  chatmodel.Factory
}

func NewModelManager(m modelmgr.Manager, f chatmodel.Factory) *ModelManager {
	if f == nil {
		f = chatmodel2.NewDefaultFactory()
	}
	return &ModelManager{
		modelMgr: m,
		factory:  f,
	}
}

func (m *ModelManager) GetModel(ctx context.Context, params *model.LLMParams) (model2.BaseChatModel, *modelmgr.Model, error) {
	modelID := params.ModelType
	models, err := m.modelMgr.MGetModelByID(ctx, &modelmgr.MGetModelRequest{
		IDs: []int64{modelID},
	})
	if err != nil {
		return nil, nil, err
	}
	var config *chatmodel.Config
	var protocol chatmodel.Protocol
	var mdl *modelmgr.Model
	for i := range models {
		md := models[i]
		if md.ID == modelID {
			protocol = md.Meta.Protocol
			config = md.Meta.ConnConfig
			mdl = md
			break
		}
	}

	if config == nil {
		return nil, nil, fmt.Errorf("model type %v ,not found config ", modelID)
	}

	if len(protocol) == 0 {
		return nil, nil, fmt.Errorf("model type %v ,not found protocol ", modelID)
	}

	if params.TopP != nil {
		config.TopP = ptr.Of(float32(ptr.From(params.TopP)))
	}

	if params.TopK != nil {
		config.TopK = params.TopK
	}

	if params.Temperature != nil {
		config.Temperature = ptr.Of(float32(ptr.From(params.Temperature)))
	}

	config.MaxTokens = ptr.Of(params.MaxTokens)

	// Whether you need to use a pointer
	config.FrequencyPenalty = ptr.Of(float32(params.FrequencyPenalty))
	config.PresencePenalty = ptr.Of(float32(params.PresencePenalty))

	cm, err := m.factory.CreateChatModel(ctx, protocol, config)
	if err != nil {
		return nil, nil, err
	}

	return cm, mdl, nil
}
