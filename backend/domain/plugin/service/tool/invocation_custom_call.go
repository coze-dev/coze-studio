package tool

import (
	"context"
	"fmt"
)

var customToolMap = make(map[string]Invocation)

func RegisterCustomTool(toolPath string, t Invocation) error {
	if _, ok := customToolMap[toolPath]; ok {
		return fmt.Errorf("custom tool %s already registered", toolPath)
	}

	customToolMap[toolPath] = t

	return nil
}

// InvokableRun(ctx context.Context, argumentsInJSON string, opts ...Option) (string, error)
type customCallImpl struct{}

func NewCustomCallImpl() Invocation {
	return &customCallImpl{}
}

func (c *customCallImpl) Do(ctx context.Context, args *InvocationArgs) (request string, resp string, err error) {
	if t, ok := customToolMap[args.Tool.GetSubURL()]; ok {
		return t.Do(ctx, args)
	}
	return "", "", fmt.Errorf("custom tool not found")
}
