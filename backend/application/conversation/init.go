package conversation

import (
	"code.byted.org/flow/opencoze/backend/application/singleagent"
	"code.byted.org/flow/opencoze/backend/domain/conversation/conversation"
	"code.byted.org/flow/opencoze/backend/domain/conversation/message"
	"code.byted.org/flow/opencoze/backend/domain/conversation/run"
	"code.byted.org/flow/opencoze/backend/infra/contract/idgen"
	"code.byted.org/flow/opencoze/backend/infra/contract/imagex"
	"code.byted.org/flow/opencoze/backend/infra/contract/storage"
	"gorm.io/gorm"
)

var (
	agentRunDomainSVC     run.Run
	conversationDomainSVC conversation.Conversation
	messageDomainSVC      message.Message
	singleAgentDomainSVC  singleagent.SingleAgent

	imagexClient imagex.ImageX
)

func InitService(db *gorm.DB, idGenSVC idgen.IDGenerator, tosClient storage.Storage, imagexCli imagex.ImageX, sa singleagent.SingleAgent) {
	imagexClient = imagexCli
	singleAgentDomainSVC = sa

	agentRunDomainSVC = run.NewService(&run.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	conversationDomainSVC = conversation.NewService(&conversation.Components{
		IDGen: idGenSVC,
		DB:    db,
	})

	messageDomainSVC = message.NewService(&message.Components{
		IDGen: idGenSVC,
		DB:    db,
	})
}
