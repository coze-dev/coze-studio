package plugin

import (
	"context"

	"code.byted.org/flow/opencoze/backend/domain/plugin/entity"
)

type ExecutorConfig struct {
	Scene entity.ExecuteScene

	PluginID int64
	ToolID   int64
	Version  string

	AgentID          int64
	UserID           int64
	AgentToolVersion int64
}

type ToolExecutor interface {
	Execute(ctx context.Context, argumentsInJson string) (result string, err error)
}

type toolExecutorImpl struct{}

func BuildToolExecutor(ctx context.Context, config *ExecutorConfig) (ToolExecutor, error) {
	return &toolExecutorImpl{}, nil
}

func (t *toolExecutorImpl) Execute(ctx context.Context, argumentsInJson string) (result string, err error) {
	panic("implement me")
}
