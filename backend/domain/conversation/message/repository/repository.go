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

	message "github.com/coze-dev/coze-studio/backend/crossdomain/message/model"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/internal/dal"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

func NewMessageRepo(db *gorm.DB, idGen idgen.IDGenerator) MessageRepo {
	return dal.NewMessageDAO(db, idGen)
}

type MessageRepo interface {
	PreCreate(ctx context.Context, msg *entity.Message) (*entity.Message, error)
	Create(ctx context.Context, msg *entity.Message) (*entity.Message, error)
	BatchCreate(ctx context.Context, msg []*entity.Message) ([]*entity.Message, error)
	List(ctx context.Context, listMeta *entity.ListMeta) ([]*entity.Message, bool, error)
	GetByRunIDs(ctx context.Context, runIDs []int64, orderBy string) ([]*entity.Message, error)
	Edit(ctx context.Context, msgID int64, message *message.Message) (int64, error)
	GetByID(ctx context.Context, msgID int64) (*entity.Message, error)
	Delete(ctx context.Context, delMeta *entity.DeleteMeta) error
}
