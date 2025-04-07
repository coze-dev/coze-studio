package agentflow

import (
	"context"
	"fmt"

	"github.com/cloudwego/eino/components/prompt"
	"github.com/cloudwego/eino/schema"

	"code.byted.org/flow/opencoze/backend/ pkg/lang/maps"
)

type personaRender struct {
	persona              string
	personaVariableNames []string
	// variables            crossdomain.Variables
	variables map[string]string
}

func (p *personaRender) RenderPersona(ctx context.Context, req *AgentRequest) (persona string, err error) {
	variables := make(map[string]string, len(p.personaVariableNames))

	for _, name := range p.personaVariableNames {
		// First try to get from req.Variables
		if val, ok := req.Variables[name]; ok {
			variables[name] = val
			continue
		}
		// Fall back to personaRender.variables
		if val, ok := p.variables[name]; ok {
			variables[name] = val
			continue
		}
		variables[name] = ""
	}

	msgs, err := prompt.FromMessages(schema.Jinja2, schema.UserMessage(p.persona)).Format(ctx, maps.ToAnyValue(variables))
	if err != nil {
		return "", fmt.Errorf("render persona failed, err=%w", err)
	}

	return msgs[0].Content, nil
}
