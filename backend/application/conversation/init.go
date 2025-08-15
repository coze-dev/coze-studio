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
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/application/singleagent"
	"github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/repository"
	agentrun "github.com/coze-dev/coze-studio/backend/domain/conversation/agentrun/service"
	convRepo "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/repository"
	conversation "github.com/coze-dev/coze-studio/backend/domain/conversation/conversation/service"
	msgRepo "github.com/coze-dev/coze-studio/backend/domain/conversation/message/repository"
	message "github.com/coze-dev/coze-studio/backend/domain/conversation/message/service"
	shortcutRepo "github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/repository"
	"github.com/coze-dev/coze-studio/backend/domain/shortcutcmd/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/imagex"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
)

type ServiceComponents struct {
	IDGen     idgen.IDGenerator
	DB        *gorm.DB
	TosClient storage.Storage
	ImageX    imagex.ImageX

	SingleAgentDomainSVC singleagent.SingleAgent
}

func InitService(s *ServiceComponents) *ConversationApplicationService {
	mDomainComponents := &message.Components{
		MessageRepo: msgRepo.NewMessageRepo(s.DB, s.IDGen),
	}
	messageDomainSVC := message.NewService(mDomainComponents)

	cDomainComponents := &conversation.Components{
		ConversationRepo: convRepo.NewConversationRepo(s.DB, s.IDGen),
	}

	conversationDomainSVC := conversation.NewService(cDomainComponents)

	arDomainComponents := &agentrun.Components{
		RunRecordRepo: repository.NewRunRecordRepo(s.DB, s.IDGen),
		ImagexSVC:     s.ImageX,
	}

	agentRunDomainSVC := agentrun.NewService(arDomainComponents)
	components := &service.Components{
		ShortCutCmdRepo: shortcutRepo.NewShortCutCmdRepo(s.DB, s.IDGen),
	}
	shortcutCmdDomainSVC := service.NewShortcutCommandService(components)

	ConversationSVC.AgentRunDomainSVC = agentRunDomainSVC
	ConversationSVC.MessageDomainSVC = messageDomainSVC
	ConversationSVC.ConversationDomainSVC = conversationDomainSVC
	ConversationSVC.appContext = s
	ConversationSVC.ShortcutDomainSVC = shortcutCmdDomainSVC

	ConversationOpenAPISVC.ShortcutDomainSVC = shortcutCmdDomainSVC

	return ConversationSVC
}
