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

package modelbuilder

import (
	"context"
	"errors"

	"github.com/cloudwego/eino-ext/components/model/ark"

	"github.com/coze-dev/coze-studio/backend/api/model/admin/config"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/conv"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type arkModelBuilder struct {
	config *config.ArkConnInfo
}

func newArkModelBuilder(config *config.ArkConnInfo) *arkModelBuilder {
	return &arkModelBuilder{
		config: config,
	}
}

func (b *arkModelBuilder) getDefaultConfig() *ark.ChatModelConfig {
	return &ark.ChatModelConfig{
		Temperature: ptr.Of(float32(0.5)),
	}
}

func (b *arkModelBuilder) Build(ctx context.Context) (ToolCallingChatModel, error) {
	if b.config == nil {
		return nil, errors.New("ark config is nil")
	}

	conf := b.getDefaultConfig()
	conf.APIKey = b.config.APIKey
	conf.Region = b.config.Region
	conf.Model = b.config.Model

	if b.config.BaseURL != "" {
		conf.BaseURL = b.config.BaseURL
	}

	if b.config.Region != "" {
		conf.Region = b.config.Region
	}

	logs.CtxDebugf(ctx, "build ark model with config: %v", conv.DebugJsonToStr(conf))

	return ark.NewChatModel(ctx, conf)
}
