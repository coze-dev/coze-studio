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

	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossmodelmgr"
	"code.byted.org/data_edc/workflow_engine_next/domain/modelmgr"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/chatmodel"
	"code.byted.org/data_edc/workflow_engine_next/pkg/errorx"
	"code.byted.org/data_edc/workflow_engine_next/types/errno"
)

type config struct {
	modelFactory chatmodel.Factory
	modelInfo    *crossmodelmgr.Model
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

	cm, err := conf.modelFactory.CreateChatModel(ctx, modelDetail.Meta.Protocol, conf.modelInfo.Meta.ConnConfig)
	if err != nil {
		return nil, err
	}

	return cm, nil
}

func loadModelInfo(ctx context.Context, modelID int64) (*crossmodelmgr.Model, error) {
	if modelID == 0 {
		return nil, fmt.Errorf("modelID is required")
	}

	models, err := crossmodelmgr.DefaultSVC().MGetModelByID(ctx, &modelmgr.MGetModelRequest{
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
