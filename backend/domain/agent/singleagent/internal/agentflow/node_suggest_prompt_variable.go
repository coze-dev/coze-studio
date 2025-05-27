package agentflow

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type suggestPromptVariables struct {
}

func (p *suggestPromptVariables) AssembleSuggestPromptVariables(ctx context.Context, vb []*schema.Message) (variables map[string]any, err error) {
	variables = make(map[string]any)

	for _, item := range vb {
		if item.Role == schema.Assistant {
			variables[placeholderOfChaAnswer] = item.Content
		}
		if item.Role == schema.User {
			variables[placeholderOfChaInput] = item.Content
		}
	}
	return variables, nil
}
