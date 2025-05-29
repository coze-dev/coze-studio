package builtin

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/compose"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/infra/contract/chatmodel"
	"code.byted.org/flow/opencoze/backend/infra/contract/messages2query"
)

func NewMessagesToQuery(ctx context.Context, model chatmodel.BaseChatModel, template prompt.ChatTemplate) (messages2query.MessagesToQuery, error) {
	ch := compose.NewChain[[]*schema.Message, string]().
		AppendLambda(compose.InvokableLambda(func(ctx context.Context, input []*schema.Message) (output map[string]any, err error) {
			if len(input) == 0 {
				return nil, fmt.Errorf("no input message")
			}

			b, err := json.MarshalIndent(input, "", "\t")
			if err != nil {
				return nil, err
			}
			return map[string]interface{}{"messages": string(b)}, nil
		})).
		AppendChatTemplate(template).
		AppendChatModel(model).
		AppendLambda(compose.InvokableLambda(func(ctx context.Context, input *schema.Message) (output string, err error) {
			return input.Content, nil
		}))

	r, err := ch.Compile(ctx)
	if err != nil {
		return nil, err
	}

	return &m2q{ch, r}, nil
}

type m2q struct {
	ch       *compose.Chain[[]*schema.Message, string]
	runnable compose.Runnable[[]*schema.Message, string]
}

func (m *m2q) MessagesToQuery(ctx context.Context, messages []*schema.Message) (newQuery string, err error) {
	return m.runnable.Invoke(ctx, messages)
}
