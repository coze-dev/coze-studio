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

package repository

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/internal/dal"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

func NewConversationRepo(db *gorm.DB, idGen idgen.IDGenerator) ConversationRepo {
	return dal.NewConversationDAO(db, idGen)
}

type ConversationRepo interface {
	Create(ctx context.Context, msg *entity.Conversation) (*entity.Conversation, error)
	GetByID(ctx context.Context, id int64) (*entity.Conversation, error)
	UpdateSection(ctx context.Context, id int64) (int64, error)
	Get(ctx context.Context, userID int64, agentID int64, scene int32, connectorID int64) (*entity.Conversation, error)
	Update(ctx context.Context, req *entity.UpdateMeta) (*entity.Conversation, error)
	Delete(ctx context.Context, id int64) (int64, error)
	List(ctx context.Context, req *entity.ListMeta) ([]*entity.Conversation, bool, error)
}
