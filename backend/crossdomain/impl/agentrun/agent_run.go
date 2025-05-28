package agentrun

import (
	"context"

	"code.byted.org/flow/opencoze/backend/crossdomain/contract/crossagentrun"
	agentrun "code.byted.org/flow/opencoze/backend/domain/conversation/agentrun/service"
)

type AgentRun interface {
	Delete(ctx context.Context, runID []int64) error
}

var defaultSVC crossagentrun.AgentRun

type impl struct {
	DomainSVC agentrun.Run
}

func InitDomainService(c agentrun.Run) crossagentrun.AgentRun {
	defaultSVC = &impl{
		DomainSVC: c,
	}

	return defaultSVC
}

func (c *impl) Delete(ctx context.Context, runID []int64) error {
	return c.DomainSVC.Delete(ctx, runID)
}
