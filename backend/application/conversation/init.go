package conversation

import (
	"gorm.io/gorm"

	"code.byted.org/flow/opencoze/backend/application/singleagent"
	"code.byted.org/flow/opencoze/backend/crossdomain/conversation/agent"
	cdAgentrun "code.byted.org/flow/opencoze/backend/crossdomain/conversation/agentrun"
	cdConversation "code.byted.org/flow/opencoze/backend/crossdomain/conversation/conversation"
	cdMessage "code.byted.org/flow/opencoze/backend/crossdomain/conversation/message"
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

var (
	agentRunDomainSVC     agentrun.Run
	conversationDomainSVC conversation.Conversation
	messageDomainSVC      message.Message

	singleAgentDomainSVC singleagent.SingleAgent

	imagexClient imagex.ImageX
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator, tosClient storage.Storage, imagexCli imagex.ImageX, sa singleagent.SingleAgent) {
	imagexClient = imagexCli
	singleAgentDomainSVC = sa

	csa := agent.NewSingleAgent(sa)

	mDomainComponents := &message.Components{
		CdAgentRun: cdAgentrun.NewCDAgentRun(agentrun.NewService(&agentrun.Components{
			CdSingleAgent: csa,
			RunRecordRepo: repository.NewRunRecordRepo(db, idGenSVC),
		})),
		MessageRepo: msgRepo.NewMessageRepo(db, idGenSVC),
	}
	messageDomainSVC = message.NewService(mDomainComponents)

	cDomainComponents := &conversation.Components{
		ConversationRepo: convRepo.NewConversationRepo(db, idGenSVC),
	}
	conversationDomainSVC = conversation.NewService(cDomainComponents)

	arDomainComponents := &agentrun.Components{
		CdMessage:      cdMessage.NewCDMessage(messageDomainSVC),
		CdSingleAgent:  csa,
		CdConversation: cdConversation.NewCDConversation(conversationDomainSVC),
		RunRecordRepo:  repository.NewRunRecordRepo(db, idGenSVC),
	}
	agentRunDomainSVC = agentrun.NewService(arDomainComponents)

}
