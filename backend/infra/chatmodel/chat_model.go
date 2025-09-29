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

package chatmodel

import (
	"context"

	"github.com/cloudwego/eino/components/model"
)

//go:generate  mockgen -destination ../../internal/mock/infra/chatmodel/base_model_mock.go -package mock -source ${GOPATH}/src/github.com/cloudwego/eino/components/model/interface.go BaseChatModel
type BaseChatModel = model.BaseChatModel

//go:generate  mockgen -destination ../../internal/mock/infra/chatmodel/toolcalling_model_mock.go -package mock -source ${GOPATH}/src/github.com/cloudwego/eino/components/model/interface.go ToolCallingChatModel
type ToolCallingChatModel = model.ToolCallingChatModel

//go:generate  mockgen -destination ../../internal/mock/infra/chatmodel/chat_model_factory_mock.go -package mock -source chat_model.go Factory
type Factory interface {
	CreateChatModel(ctx context.Context, protocol Protocol, config *Config) (ToolCallingChatModel, error)
	SupportProtocol(protocol Protocol) bool
}
