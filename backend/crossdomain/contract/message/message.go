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

package message

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/api/model/crossdomain/message"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/message/entity"
)

type Message interface {
	GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*message.Message, error)
	PreCreate(ctx context.Context, msg *message.Message) (*message.Message, error)
	Create(ctx context.Context, msg *message.Message) (*message.Message, error)
	List(ctx context.Context, meta *entity.ListMeta) (*entity.ListResult, error)
	ListWithoutPair(ctx context.Context, req *entity.ListMeta) (*entity.ListResult, error)
	Edit(ctx context.Context, msg *message.Message) (*message.Message, error)
	Delete(ctx context.Context, req *entity.DeleteMeta) error
	GetMessageByID(ctx context.Context, id int64) (*entity.Message, error)
}

var defaultSVC Message

type MessageMeta = message.Message

func DefaultSVC() Message {
	return defaultSVC
}

func SetDefaultSVC(c Message) {
	defaultSVC = c
}
