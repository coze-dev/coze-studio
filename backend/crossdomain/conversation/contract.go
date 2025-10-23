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

	model "github.com/coze-dev/coze-studio/backend/crossdomain/conversation/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
)

//go:generate  mockgen -destination conversationmock/conversation_mock.go --package conversationmock -source conversation.go
type Conversation interface {
	GetCurrentConversation(ctx context.Context, req *model.GetCurrent) (*model.Conversation, error)
	CreateConversation(ctx context.Context, req *entity.CreateMeta) (*entity.Conversation, error)
	ClearConversationHistory(ctx context.Context, req *ClearConversationHistoryReq) (*entity.NewConversationCtxResponse, error)
	GetByID(ctx context.Context, id int64) (*entity.Conversation, error)
}

var defaultSVC Conversation

func DefaultSVC() Conversation {
	return defaultSVC
}

func SetDefaultSVC(c Conversation) {
	defaultSVC = c
}

type ClearConversationHistoryReq struct {
	ConversationID int64
}
