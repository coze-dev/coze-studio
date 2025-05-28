package crossagentrun

import (
	"context"

	agentrun "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/service"
)

type AgentRun interface {
	Delete(ctx context.Context, runID []int64) error
}

var defaultSVC *impl

type impl struct {
	DomainSVC agentrun.Run
}

func InitDomainService(c agentrun.Run) {
	defaultSVC = &impl{
		DomainSVC: c,
	}
}

func DefaultSVC() AgentRun {
	return defaultSVC
}

func (c *impl) Delete(ctx context.Context, runID []int64) error {
	return c.DomainSVC.Delete(ctx, runID)
}
