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

package modelmgr

import (
	"context"
	"fmt"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/api/model/app/developer_api"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr/internal/model"
	"github.com/coze-dev/coze-studio/backend/bizpkg/config/modelmgr/internal/query"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

func (c *ModelConfig) CreateModel(ctx context.Context, modelClass developer_api.ModelClass, modelName string, conn *config.Connection) (int64, error) {
	if conn == nil {
		return 0, fmt.Errorf("connection is nil")
	}

	provider, ok := GetModelProvider(modelClass)
	if !ok {
		return 0, fmt.Errorf("model class %s not supported", modelClass)
	}

	conn, err := encryptConn(ctx, conn)
	if err != nil {
		return 0, err
	}

	// TODO: default Capability、Parameters

	q := query.ModelInstance.WithContext(ctx)
	m := &model.ModelInstance{
		Type:       1,
		Provider:   provider,
		Connection: conn,
		Capability: &developer_api.ModelAbility{
			CotDisplay:         ptr.Of(true),
			FunctionCall:       ptr.Of(true),
			ImageUnderstanding: ptr.Of(true),
			VideoUnderstanding: ptr.Of(false),
			AudioUnderstanding: ptr.Of(false),
			SupportMultiModal:  ptr.Of(true),
			PrefillResp:        ptr.Of(false),
		},
		Parameters: []*developer_api.ModelParameter{
			{
				Name:      temperature,
				Label:     "生成随机性",
				Desc:      "- **temperature**: 调高温度会使得模型的输出更多样性和创新性，反之，降低温度会使输出内容更加遵循指令要求但减少多样性。建议不要与“Top p”同时调整。",
				Type:      developer_api.ModelParamType_Float,
				Min:       "0",
				Max:       "1",
				Precision: 1,
				DefaultVal: &developer_api.ModelParamDefaultValue{
					DefaultVal: "1.0",
					Creative:   ptr.Of("1"),
					Balance:    ptr.Of("0.8"),
					Precise:    ptr.Of("0.3"),
				},
				ParamClass: &developer_api.ModelParamClass{
					ClassID: 1,
					Label:   "生成多样性",
				},
				Options: []*developer_api.Option{},
			},
			{
				Name:      maxTokens,
				Label:     "最大回复长度",
				Desc:      "控制模型输出的Tokens 长度上限。通常 100 Tokens 约等于 150 个中文汉字。",
				Type:      developer_api.ModelParamType_Int,
				Min:       "1",
				Max:       "4096",
				Precision: 0,
				DefaultVal: &developer_api.ModelParamDefaultValue{
					DefaultVal: "4096",
				},
				ParamClass: &developer_api.ModelParamClass{
					ClassID: 1,
					Label:   "输入及输出设置",
				},
				Options: []*developer_api.Option{},
			},
			{
				Name:      topP,
				Label:     "Top P",
				Desc:      "- **Top p 为累计概率**: 模型在生成输出时会从概率最高的词汇开始选择，直到这些词汇的总概率累积达到Top p 值。这样可以限制模型只选择这些高概率的词汇，从而控制输出内容的多样性。建议不要与“生成随机性”同时调整。",
				Type:      developer_api.ModelParamType_Float,
				Min:       "0",
				Max:       "1",
				Precision: 2,
				DefaultVal: &developer_api.ModelParamDefaultValue{
					DefaultVal: "0.7",
				},
				ParamClass: &developer_api.ModelParamClass{
					ClassID: 1,
					Label:   "生成多样性",
				},
				Options: []*developer_api.Option{},
			},
			{
				Name:  responseFormat,
				Label: "输出格式",
				Desc:  "控制模型输出的格式，支持 text, markdown, json。",
				Type:  developer_api.ModelParamType_Int,
				Options: []*developer_api.Option{
					{
						Label: "Text",
						Value: "0",
					},
					{
						Label: "JSON",
						Value: "1",
					},
				},
				Min:       "",
				Max:       "",
				Precision: 0,
				DefaultVal: &developer_api.ModelParamDefaultValue{
					DefaultVal: "0",
				},
				ParamClass: &developer_api.ModelParamClass{
					ClassID: 2,
					Label:   "输入及输出设置",
				},
			},
		},
		DisplayInfo: &config.DisplayInfo{
			Name:         modelName,
			Description:  provider.Description,
			MaxTokens:    256 * 1024,
			OutputTokens: 256 * 1024,
		},
		Extra: "{}",
	}

	err = q.Create(m)
	if err != nil {
		return 0, err
	}

	err = c.SetDoNotUseOldModelConf(ctx)
	if err != nil {
		return 0, fmt.Errorf("set do not use old model failed, err: %w", err)
	}

	return m.ID, nil
}

func (c *ModelConfig) DeleteModel(ctx context.Context, modelID int64) error {
	q := query.ModelInstance.WithContext(ctx)
	_, err := q.Where(query.ModelInstance.ID.Eq(modelID)).Delete()
	return err
}

func encryptConn(ctx context.Context, conn *config.Connection) (*config.Connection, error) {
	// encrypt conn if you need
	return conn, nil
}

func decryptConn(ctx context.Context, conn *config.Connection) (*config.Connection, error) {
	return conn, nil
}
