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

	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
)

//go:generate mockgen -destination ../../../../internal/mock/domain/conversation/conversation/conversation_mock.go --package conversation -source conversation.go
type Conversation interface {
	Create(ctx context.Context, req *entity.CreateMeta) (*entity.Conversation, error)
	GetByID(ctx context.Context, id int64) (*entity.Conversation, error)
	NewConversationCtx(ctx context.Context, req *entity.NewConversationCtxRequest) (*entity.NewConversationCtxResponse, error)
	GetCurrentConversation(ctx context.Context, req *entity.GetCurrent) (*entity.Conversation, error)
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, req *entity.ListMeta) ([]*entity.Conversation, bool, error)
	Update(ctx context.Context, req *entity.UpdateMeta) (*entity.Conversation, error)
}
