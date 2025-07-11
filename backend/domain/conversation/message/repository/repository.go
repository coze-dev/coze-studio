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

	"code.byted.org/data_edc/workflow_engine_next/api/model/crossdomain/message"
	"code.byted.org/data_edc/workflow_engine_next/domain/conversation/message/entity"
	"code.byted.org/data_edc/workflow_engine_next/domain/conversation/message/internal/dal"
	"code.byted.org/data_edc/workflow_engine_next/infra/contract/idgen"
)

func NewMessageRepo(db *gorm.DB, idGen idgen.IDGenerator) MessageRepo {
	return dal.NewMessageDAO(db, idGen)
}

type MessageRepo interface {
	Create(ctx context.Context, msg *entity.Message) (*entity.Message, error)
	List(ctx context.Context, conversationID int64, limit int, cursor int64,
		direction entity.ScrollPageDirection, messageType *message.MessageType) ([]*entity.Message, bool, error)
	GetByRunIDs(ctx context.Context, runIDs []int64, orderBy string) ([]*entity.Message, error)
	Edit(ctx context.Context, msgID int64, message *message.Message) (int64, error)
	GetByID(ctx context.Context, msgID int64) (*entity.Message, error)
	Delete(ctx context.Context, msgIDs []int64, runIDs []int64) error
}
