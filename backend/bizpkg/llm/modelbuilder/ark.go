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

	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
)

type arkModelBuilder struct {
	config *ark.ChatModelConfig
}

func newArkModelBuilder(config *ark.ChatModelConfig) *arkModelBuilder {
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

	defaultConf := b.getDefaultConfig()

	if b.config.Temperature == nil {
		b.config.Temperature = defaultConf.Temperature
	}

	return ark.NewChatModel(ctx, b.config)
}
