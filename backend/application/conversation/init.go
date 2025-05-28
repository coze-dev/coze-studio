package conversation

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/application/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/repository"
	agentrun "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/service"
	convRepo "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/repository"
	conversation "code.byted.org/flow/opencoze/backend/domain/conversation/conversation/service"
	msgRepo "code.byted.org/flow/opencoze/backend/domain/conversation/message/repository"
	message "code.byted.org/flow/opencoze/backend/domain/conversation/message/service"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
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
	}

	agentRunDomainSVC := agentrun.NewService(arDomainComponents)

	ConversationSVC.AgentRunDomainSVC = agentRunDomainSVC
	ConversationSVC.MessageDomainSVC = messageDomainSVC
	ConversationSVC.ConversationDomainSVC = conversationDomainSVC
	ConversationSVC.appContext = s

	return ConversationSVC
}
