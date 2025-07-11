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

	model "code.byted.org/data_edc/workflow_engine_next/api/model/crossdomain/message"
	"code.byted.org/data_edc/workflow_engine_next/crossdomain/contract/crossmessage"
	message "code.byted.org/data_edc/workflow_engine_next/domain/conversation/message/service"
)

var defaultSVC crossmessage.Message

type impl struct {
	DomainSVC message.Message
}

func InitDomainService(c message.Message) crossmessage.Message {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *impl) GetByRunIDs(ctx context.Context, conversationID int64, runIDs []int64) ([]*model.Message, error) {
	return c.DomainSVC.GetByRunIDs(ctx, conversationID, runIDs)
}

func (c *impl) Create(ctx context.Context, msg *model.Message) (*model.Message, error) {
	return c.DomainSVC.Create(ctx, msg)
}

func (c *impl) Edit(ctx context.Context, msg *model.Message) (*model.Message, error) {
	return c.DomainSVC.Edit(ctx, msg)
}
