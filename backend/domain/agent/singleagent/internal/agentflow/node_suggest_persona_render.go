package agentflow

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"
)

type suggestPersonaRender struct {
	persona string
}

func (p *suggestPersonaRender) RenderPersona(ctx context.Context, _ []*schema.Message) (persona string, err error) {

	if p.persona == "" {
		return "", nil
	}

	msgs, err := prompt.FromMessages(schema.Jinja2, schema.UserMessage(p.persona)).Format(ctx, nil)
	if err != nil {
		return "", fmt.Errorf("render persona failed, err=%w", err)
	}

	return msgs[0].Content, nil
}
