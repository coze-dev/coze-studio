package tool

import (
	"context"
	"errors"
)

type mcpCallImpl struct {
}

func NewMcpCallImpl() Invocation {
	return &mcpCallImpl{}
}

func (m *mcpCallImpl) Do(ctx context.Context, args *InvocationArgs) (request string, resp string, err error) {
	return "", "", errors.New("mcp call not implemented")
}
