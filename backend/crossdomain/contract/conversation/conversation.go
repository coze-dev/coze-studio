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

package conversation

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/conversation"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
)

type Conversation interface {
	GetCurrentConversation(ctx context.Context, req *conversation.GetCurrent) (*conversation.Conversation, error)
	Create(ctx context.Context, req *entity.CreateMeta) (*entity.Conversation, error)
	NewConversationCtx(ctx context.Context, req *entity.NewConversationCtxRequest) (*entity.NewConversationCtxResponse, error)
	GetByID(ctx context.Context, id int64) (*entity.Conversation, error)
}

var defaultSVC Conversation

func DefaultSVC() Conversation {
	return defaultSVC
}

func SetDefaultSVC(c Conversation) {
	defaultSVC = c
}
