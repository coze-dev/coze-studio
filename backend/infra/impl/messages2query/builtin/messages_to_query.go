package builtin

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/contract/messages2query"
	"code.byted.org/flow/opencoze/backend/pkg/logs"
)

func NewMessagesToQuery(model chatmodel.ChatModel, systemPrompt string) messages2query.MessagesToQuery {
	return &m2q{model: model, systemPrompt: systemPrompt}
}

type m2q struct {
	model        chatmodel.ChatModel
	systemPrompt string
}

func (m *m2q) MessagesToQuery(ctx context.Context, chatHistory []*schema.Message) (newQuery string, err error) {
	if len(chatHistory) == 0 {
		return "", fmt.Errorf("[MessagesToQuery] no chat history")
	}

	tpl := prompt.FromMessages(schema.Jinja2,
		schema.SystemMessage(m.systemPrompt),
		schema.UserMessage("{{chat_history}}"),
	)

	userQuery, err := tpl.Format(ctx, map[string]interface{}{"chat_history": chatHistory})
	if err != nil {
		logs.CtxErrorf(ctx, "render template failed: %v", err)
		return "", err
	}

	inputs := chatHistory
	inputs = append(inputs, userQuery...)
	message, err := m.model.Generate(ctx, inputs)
	if err != nil {
		logs.CtxErrorf(ctx, "generate failed: %v", err)
		logs.CtxInfof(ctx, "查询改写失败，使用原始query")
		return chatHistory[len(chatHistory)-1].Content, nil
	}

	return message.Content, nil
}
