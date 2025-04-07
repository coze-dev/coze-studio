package agentflow

import (
	"context"

	"github.com/cloudwego/eino/schema"
)

type knowledge struct {
}

func (k *knowledge) Retrieve(ctx context.Context, req *AgentRequest) ([]*schema.Document, error) {

	return nil, nil
}
